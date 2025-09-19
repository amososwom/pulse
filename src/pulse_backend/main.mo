// backend/combined/main.mo
// Single canister: multi-token ledger + marketplace (MVP)
// - create_token(...) -> creates a new fungible token with metadata including logo_url
// - transfer / approve / transferFrom -> standard token ops
// - marketplace: sellers list (token_id, amount, price_token_id, price_amount), buyers purchase via approve+buy flow

import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Array "mo:base/Array";

persistent actor PulseMarket {

  //
  // Types
  //
  public type TokenId = Nat;
  public type Tokens = Nat;

  // Basic account = Principal (no subaccounts here for simplicity)
  public type Account = Principal;

  // Approval record: owner approved spender to use up to allowance
  public type Approval = {
    tokenId : TokenId;
    owner : Account;
    spender : Account;
    allowance : Tokens;
    expires_at : ?Nat64;
  };

  // Token metadata and storage
  public type Token = {
    id : TokenId;
    name : Text;
    symbol : Text;
    decimals : Nat8;
    minting_account : Account;
    total_supply : Tokens;
    logo_url : ?Text;                 // optional URL for icon/image
    balances : [ (Account, Tokens) ]; // small-map via array (MVP)
    approvals : [ Approval ];         // approvals array
  };

  // Marketplace listing (seller lists `amount` of token `tokenId` asking `price_amount` of currency token `price_tokenId`)
  public type Listing = {
    id : Nat;
    tokenId : TokenId;
    seller : Account;
    amount : Tokens;
    price_tokenId : TokenId;          // the token used as currency
    price_amount_per_token : Tokens;  // price per item in units of price_token
    created_at : Nat64;
    active : Bool;
  };

  //
  // State
  //
  private var tokens : [ Token ] = [];
  private var listings : [ Listing ] = [];
  private var nextTokenId : TokenId = 0;
  private var nextListingId : Nat = 0;

  //
  // Helpers: find token by id
  //
  func findTokenIndex(id : TokenId) : ?Nat {
    var i : Nat = 0;
    while (i < Array.size(tokens)) {
      if (tokens[i].id == id) { return ?i };
      i += 1;
    };
    null
  };

  func requireToken(id : TokenId) : Token {
    switch (findTokenIndex(id)) {
      case (?idx) tokens[idx];
      case null Debug.trap("token not found");
    }
  };

  //
  // Balance helpers (per token)
  // returns (indexInBalancesArray, currentBalance) where index may be Array.size(...) to indicate not found
  //
  func getBalanceRef(tokenIdx : Nat, who : Account) : (Nat, Tokens) {
    let arr = tokens[tokenIdx].balances;
    var i : Nat = 0;
    while (i < Array.size(arr)) {
      if (Principal.equal(arr[i].0, who)) { return (i, arr[i].1) };
      i += 1;
    };
    (Array.size(arr), 0)
  };

  func setBalance(tokenIdx : Nat, who : Account, amount : Tokens) : () {
    let (idx, _) = getBalanceRef(tokenIdx, who);
    let token = tokens[tokenIdx];
    if (idx < Array.size(token.balances)) {
      let newBalances = Array.tabulate<(Account, Tokens)>(Array.size(token.balances), func(i : Nat) : (Account, Tokens) {
        if (i == idx) { (who, amount) } else { token.balances[i] }
      });
      let updatedToken = {
        id = token.id;
        name = token.name;
        symbol = token.symbol;
        decimals = token.decimals;
        minting_account = token.minting_account;
        total_supply = token.total_supply;
        logo_url = token.logo_url;
        balances = newBalances;
        approvals = token.approvals;
      };
      tokens := Array.tabulate<Token>(Array.size(tokens), func(i : Nat) : Token {
        if (i == tokenIdx) { updatedToken } else { tokens[i] }
      });
    } else {
      let updatedToken = {
        id = token.id;
        name = token.name;
        symbol = token.symbol;
        decimals = token.decimals;
        minting_account = token.minting_account;
        total_supply = token.total_supply;
        logo_url = token.logo_url;
        balances = Array.append(token.balances, [(who, amount)]);
        approvals = token.approvals;
      };
      tokens := Array.tabulate<Token>(Array.size(tokens), func(i : Nat) : Token {
        if (i == tokenIdx) { updatedToken } else { tokens[i] }
      });
    };
  };

  func addBalance(tokenIdx : Nat, who : Account, delta : Tokens) : () {
    let (idx, cur) = getBalanceRef(tokenIdx, who);
    let newVal = cur + delta;
    setBalance(tokenIdx, who, newVal);
  };

  func subBalance(tokenIdx : Nat, who : Account, delta : Tokens) : Bool {
    let (idx, cur) = getBalanceRef(tokenIdx, who);
    if (cur < delta) { false } else {
      setBalance(tokenIdx, who, cur - delta);
      true
    }
  };

  //
  // Approval helpers
  //
  func findApprovalIndex(tokenIdx : Nat, owner : Account, spender : Account) : ?Nat {
    var i : Nat = 0;
    let arr = tokens[tokenIdx].approvals;
    while (i < Array.size(arr)) {
      if (arr[i].tokenId == tokens[tokenIdx].id
          and Principal.equal(arr[i].owner, owner)
          and Principal.equal(arr[i].spender, spender)) {
        return ?i;
      };
      i += 1;
    };
    null
  };

  func getAllowance(tokenIdx : Nat, owner : Account, spender : Account) : Tokens {
    switch (findApprovalIndex(tokenIdx, owner, spender)) {
      case (?i) tokens[tokenIdx].approvals[i].allowance;
      case null 0;
    }
  };

  func setAllowance(tokenIdx : Nat, owner : Account, spender : Account, amt : Tokens) : () {
    let token = tokens[tokenIdx];
    switch (findApprovalIndex(tokenIdx, owner, spender)) {
      case (?i) {
        let newApprovals = Array.tabulate<Approval>(Array.size(token.approvals), func(j : Nat) : Approval {
          if (j == i) {
            {
              tokenId = token.approvals[j].tokenId;
              owner = token.approvals[j].owner;
              spender = token.approvals[j].spender;
              allowance = amt;
              expires_at = token.approvals[j].expires_at;
            }
          } else {
            token.approvals[j]
          }
        });
        let updatedToken = {
          id = token.id;
          name = token.name;
          symbol = token.symbol;
          decimals = token.decimals;
          minting_account = token.minting_account;
          total_supply = token.total_supply;
          logo_url = token.logo_url;
          balances = token.balances;
          approvals = newApprovals;
        };
        tokens := Array.tabulate<Token>(Array.size(tokens), func(k : Nat) : Token {
          if (k == tokenIdx) { updatedToken } else { tokens[k] }
        });
      };
      case null {
        let newApproval = {
          tokenId = token.id;
          owner = owner;
          spender = spender;
          allowance = amt;
          expires_at = null;
        };
        let updatedToken = {
          id = token.id;
          name = token.name;
          symbol = token.symbol;
          decimals = token.decimals;
          minting_account = token.minting_account;
          total_supply = token.total_supply;
          logo_url = token.logo_url;
          balances = token.balances;
          approvals = Array.append(token.approvals, [newApproval]);
        };
        tokens := Array.tabulate<Token>(Array.size(tokens), func(k : Nat) : Token {
          if (k == tokenIdx) { updatedToken } else { tokens[k] }
        });
      };
    };
  };

  func decAllowance(tokenIdx : Nat, owner : Account, spender : Account, amt : Tokens) : Bool {
    let cur = getAllowance(tokenIdx, owner, spender);
    if (cur < amt) { false } else {
      setAllowance(tokenIdx, owner, spender, cur - amt);
      true
    }
  };

  //
  // Token API (multi-token)
  //

  // create_token: anyone can create a new token. Caller becomes minting account and receives initial_supply.
  public shared ({ caller }) func create_token(
    token_name : Text,
    token_symbol : Text,
    initial_supply : Tokens,
    decimals : Nat8,
    logo_url : ?Text
  ) : async TokenId {
    if (Principal.isAnonymous(caller)) { Debug.trap("anonymous cannot create token") };

    let id = nextTokenId;
    nextTokenId += 1;

    let t : Token = {
      id = id;
      name = token_name;
      symbol = token_symbol;
      decimals = decimals;
      minting_account = caller;
      total_supply = initial_supply;
      logo_url = logo_url;
      balances = if (initial_supply > 0) { [(caller, initial_supply)] } else { [] };
      approvals = [];
    };

    tokens := Array.append(tokens, [t]);
    id
  };

  // basic queries
  public query func token_metadata(tokenId : TokenId) : async ?(Text, Text, Nat8, ?Text) {
    switch (findTokenIndex(tokenId)) {
      case (?i) ?(tokens[i].name, tokens[i].symbol, tokens[i].decimals, tokens[i].logo_url);
      case null null;
    }
  };

  public query func balance_of(tokenId : TokenId, who : Account) : async Tokens {
    switch (findTokenIndex(tokenId)) {
      case (?i) {
        let (_, bal) = getBalanceRef(i, who);
        bal
      };
      case null 0;
    }
  };

  public query func total_supply(tokenId : TokenId) : async Tokens {
    switch (findTokenIndex(tokenId)) {
      case (?i) tokens[i].total_supply;
      case null 0;
    }
  };

  // send / transfer: caller sends their tokens to `to`
  public shared ({ caller }) func transfer(tokenId : TokenId, to : Account, amount : Tokens) : async Bool {
    switch (findTokenIndex(tokenId)) {
      case (?i) {
        if (not subBalance(i, caller, amount)) { return false };
        addBalance(i, to, amount);
        true
      };
      case null false;
    }
  };

  // approve: owner (caller) allows spender to spend up to allowance
  public shared ({ caller }) func approve(tokenId : TokenId, spender : Account, allowance : Tokens) : async Bool {
    switch (findTokenIndex(tokenId)) {
      case (?i) {
        setAllowance(i, caller, spender, allowance);
        true
      };
      case null false;
    }
  };

  // transferFrom: spender (caller) moves tokens from owner -> recipient using allowance
  public shared ({ caller }) func transferFrom(tokenId : TokenId, owner : Account, recipient : Account, amount : Tokens) : async Bool {
    switch (findTokenIndex(tokenId)) {
      case (?i) {
        // if caller is owner, allow direct debit (same as transfer)
        if (Principal.equal(caller, owner)) {
          if (not subBalance(i, owner, amount)) { return false };
          addBalance(i, recipient, amount);
          return true;
        };
        // else need allowance
        if (not decAllowance(i, owner, caller, amount)) { return false };
        if (not subBalance(i, owner, amount)) {
          // revert allowance if debit fails
          let current = getAllowance(i, owner, caller);
          setAllowance(i, owner, caller, current + amount);
          return false;
        };
        addBalance(i, recipient, amount);
        true
      };
      case null false;
    }
  };

  //
  // Marketplace API
  //
  // Seller lists `amount` of token `tokenId` asking price in tokens of `price_tokenId`.
  // Buyer must call approve(price_tokenId, marketplace_canister, total_price) before buy.
  //
  public shared ({ caller }) func create_listing(tokenId : TokenId, amount : Tokens, price_tokenId : TokenId, price_amount_per_token : Tokens) : async Nat {
    // require seller to own the amount (simple check)
    switch (findTokenIndex(tokenId)) {
      case (?ti) {
        let (_, bal) = getBalanceRef(ti, caller);
        if (bal < amount) { Debug.trap("insufficient token balance to list") };
        // we use allowance/transferFrom model for sale (seller must approve marketplace)
        let listing : Listing = {
          id = nextListingId;
          tokenId = tokenId;
          seller = caller;
          amount = amount;
          price_tokenId = price_tokenId;
          price_amount_per_token = price_amount_per_token;
          created_at = Nat64.fromNat(Int.abs(Time.now()));
          active = true;
        };
        listings := Array.append(listings, [listing]);
        nextListingId += 1;
        listing.id
      };
      case null Debug.trap("token not found");
    }
  };

  // buyer executes purchase: marketplace moves price_token from buyer -> seller, and token from seller -> buyer
  // buyer must have approved marketplace to spend the total price on price_token
  public shared ({ caller }) func buy(listingId : Nat, amount_to_buy : Tokens) : async Bool {
    // find listing index
    var liIdx : ?Nat = null;
    var i : Nat = 0;
    label findLoop while (i < Array.size(listings)) {
      if (listings[i].id == listingId) { 
        liIdx := ?i; 
        break findLoop;
      };
      i += 1;
    };

    switch (liIdx) {
      case null { Debug.trap("listing not found") };
      case (?idx) {
        let l = listings[idx];
        if (not l.active) { Debug.trap("listing inactive") };
        if (amount_to_buy > l.amount) { Debug.trap("not enough listed amount") };

        // compute total price in price_token units
        let total_price : Tokens = amount_to_buy * l.price_amount_per_token;

        // step 1: pull price_token from buyer -> seller
        let okPrice = await transferFrom(l.price_tokenId, caller, l.seller, total_price);
        if (not okPrice) { Debug.trap("price payment failed: ensure you approved marketplace and have funds") };

        // step 2: transfer sold token from seller -> buyer
        let okToken = await transferFrom(l.tokenId, l.seller, caller, amount_to_buy);
        if (not okToken) {
          // attempt to refund buyer
          ignore await transfer(l.price_tokenId, caller, total_price);
          Debug.trap("token transfer failed: seller didn't approve marketplace or has insufficient balance");
        };

        // update listing - create new listing with updated values
        let newAmount = l.amount - amount_to_buy;
        let updatedListing = {
          id = l.id;
          tokenId = l.tokenId;
          seller = l.seller;
          amount = newAmount;
          price_tokenId = l.price_tokenId;
          price_amount_per_token = l.price_amount_per_token;
          created_at = l.created_at;
          active = if (newAmount == 0) { false } else { true };
        };
        
        listings := Array.tabulate<Listing>(Array.size(listings), func(j : Nat) : Listing {
          if (j == idx) { updatedListing } else { listings[j] }
        });

        true
      }
    }
  };

  // Seller or owner can cancel a listing
  public shared ({ caller }) func cancel_listing(listingId : Nat) : async Bool {
    var liIdx : ?Nat = null;
    var i : Nat = 0;
    label findLoop while (i < Array.size(listings)) {
      if (listings[i].id == listingId) { 
        liIdx := ?i; 
        break findLoop;
      };
      i += 1;
    };
    
    switch (liIdx) {
      case null Debug.trap("listing not found");
      case (?idx) {
        if (not Principal.equal(listings[idx].seller, caller)) { Debug.trap("only seller can cancel") };
        let l = listings[idx];
        let updatedListing = {
          id = l.id;
          tokenId = l.tokenId;
          seller = l.seller;
          amount = l.amount;
          price_tokenId = l.price_tokenId;
          price_amount_per_token = l.price_amount_per_token;
          created_at = l.created_at;
          active = false;
        };
        listings := Array.tabulate<Listing>(Array.size(listings), func(j : Nat) : Listing {
          if (j == idx) { updatedListing } else { listings[j] }
        });
        true
      }
    }
  };

  // Query listing
  public query func get_listing(listingId : Nat) : async ?Listing {
    var i : Nat = 0;
    while (i < Array.size(listings)) {
      if (listings[i].id == listingId) return ?listings[i];
      i += 1;
    };
    null
  };

  public query func list_count() : async Nat {
    Array.size(listings)
  };

  // Utility: list token ids
  public query func all_tokens() : async [ TokenId ] {
    Array.map<Token, TokenId>(tokens, func(token : Token) : TokenId { token.id })
  };

  // Utility: token info (including logo_url) for UI
  public query func token_info(tokenId : TokenId) : async ?{
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Tokens;
    minting_account : Account;
    logo_url : ?Text;
  } {
    switch (findTokenIndex(tokenId)) {
      case (?i) {
        ?{
          name = tokens[i].name;
          symbol = tokens[i].symbol;
          decimals = tokens[i].decimals;
          total_supply = tokens[i].total_supply;
          minting_account = tokens[i].minting_account;
          logo_url = tokens[i].logo_url;
        }
      };
      case null null;
    }
  };

  public query (message) func whoami() : async Principal {
    message.caller;
  };

  //
  // Notes:
  // - This is an MVP-friendly single-canister approach. For production:
  //   * Replace simple array maps with more scalable storage structures (Trie, stable memory)
  //   * Add subaccount support
  //   * Add robust error codes instead of Debug.trap
  //   * Integrate with the official ICP ICRC-1 ledger for ICP payments if you want ICP as currency
  //
};