// backend/main.mo
// Enhanced multi-token ledger with role-based access control and Internet Identity support

import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Option "mo:base/Option";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

persistent actor PulseMarket {

  //
  // Types
  //
  public type TokenId = Nat;
  public type Tokens = Nat;
  public type Account = Principal;

  // Enhanced user roles with hierarchy
  public type UserRole = {
    #Admin;
    #Creator;  
    #User;
  };

  // Enhanced error types for better error handling
  public type CreateTokenError = {
    #InvalidName;
    #InvalidSymbol;
    #InvalidSupply;
    #AnonymousNotAllowed;
    #InsufficientPermissions;
    #RateLimitExceeded;
    #InternalError : Text;
  };

  public type TransferError = {
    #TokenNotFound;
    #InsufficientBalance;
    #SelfTransfer;
    #InsufficientPermissions;
    #InternalError : Text;
  };

  public type ApprovalError = {
    #TokenNotFound;
    #SelfApproval;
    #InsufficientPermissions;
    #InternalError : Text;
  };

  // User profile with role management
  public type UserProfile = {
    principal : Account;
    role : UserRole;
    createdAt : Nat64;
    lastActive : Nat64;
    tokensCreated : Nat;
    isVerified : Bool;
  };

  // Approval record with expiration support
  public type Approval = {
    tokenId : TokenId;
    owner : Account;
    spender : Account;
    allowance : Tokens;
    expires_at : ?Nat64;
    created_at : Nat64;
  };

  // Enhanced token metadata
  public type TokenMetadata = {
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Tokens;
    minting_account : Account;
    logo_url : ?Text;
    description : ?Text;
    created_at : Nat64;
  };

  // Token with enhanced structure
  public type Token = {
    id : TokenId;
    metadata : TokenMetadata;
    balances : [(Account, Tokens)];
    approvals : [Approval];
  };

  // Marketplace listing
  public type Listing = {
    id : Nat;
    tokenId : TokenId;
    seller : Account;
    amount : Tokens;
    price_tokenId : TokenId;
    price_amount_per_token : Tokens;
    created_at : Nat64;
    active : Bool;
  };

  //
  // State
  //
  private stable var tokens : [Token] = [];
  private stable var listings : [Listing] = [];
  private stable var userProfilesStable : [(Account, UserProfile)] = [];
  private var userProfiles : HashMap.HashMap<Account, UserProfile> = HashMap.HashMap<Account, UserProfile>(10, Principal.equal, Principal.hash);
  private stable var adminPrincipals : [Account] = [];
  private stable var nextTokenId : TokenId = 0;
  private stable var nextListingId : Nat = 0;

  // Initialize with admin principals (add your principals here)
  private func initializeAdmins() {
    // Add your admin principals here - replace with actual principals
    // adminPrincipals := [
    //   Principal.fromText("your-admin-principal-1"),
    //   Principal.fromText("your-admin-principal-2")
    // ];
  };

  // System upgrade hooks
  system func preupgrade() {
    userProfilesStable := Iter.toArray(userProfiles.entries());
  };

  system func postupgrade() {
    userProfiles := HashMap.fromIter<Account, UserProfile>(
      userProfilesStable.vals(), 
      userProfilesStable.size(), 
      Principal.equal, 
      Principal.hash
    );
    userProfilesStable := [];
    initializeAdmins();
  };

  //
  // Helper Functions
  //

  // Role management helpers
  private func isAdmin(principal : Account) : Bool {
    switch (userProfiles.get(principal)) {
      case (?profile) {
        switch (profile.role) {
          case (#Admin) true;
          case (_) false;
        }
      };
      case null {
        // Check hardcoded admin list
        for (admin in adminPrincipals.vals()) {
          if (Principal.equal(admin, principal)) return true;
        };
        false
      };
    }
  };

  private func hasCreatePermission(principal : Account) : Bool {
    switch (userProfiles.get(principal)) {
      case (?profile) {
        switch (profile.role) {
          case (#Admin) true;
          case (#Creator) true;
          case (#User) false;
        }
      };
      case null {
        // Check if hardcoded admin
        isAdmin(principal)
      };
    }
  };

  private func getUserOrCreate(principal : Account) : UserProfile {
    switch (userProfiles.get(principal)) {
      case (?profile) profile;
      case null {
        let role = if (isAdmin(principal)) #Admin else #User;
        let newProfile : UserProfile = {
          principal = principal;
          role = role;
          createdAt = Nat64.fromNat(Int.abs(Time.now()));
          lastActive = Nat64.fromNat(Int.abs(Time.now()));
          tokensCreated = 0;
          isVerified = false;
        };
        userProfiles.put(principal, newProfile);
        newProfile
      };
    }
  };

  private func updateUserActivity(principal : Account) {
    switch (userProfiles.get(principal)) {
      case (?profile) {
        let updatedProfile = {
          principal = profile.principal;
          role = profile.role;
          createdAt = profile.createdAt;
          lastActive = Nat64.fromNat(Int.abs(Time.now()));
          tokensCreated = profile.tokensCreated;
          isVerified = profile.isVerified;
        };
        userProfiles.put(principal, updatedProfile);
      };
      case null {
        ignore getUserOrCreate(principal);
      };
    }
  };

  // Validate text inputs
  private func isValidName(name : Text) : Bool {
    let size = Text.size(name);
    size >= 2 and size <= 50
  };

  private func isValidSymbol(symbol : Text) : Bool {
    let size = Text.size(symbol);
    size >= 2 and size <= 10
  };

  // Find token by ID
  private func findTokenIndex(id : TokenId) : ?Nat {
    var i : Nat = 0;
    for (token in tokens.vals()) {
      if (token.id == id) return ?i;
      i += 1;
    };
    null
  };

  // Get balance for account in specific token
  private func getBalance(tokenIdx : Nat, account : Account) : Tokens {
    let token = tokens[tokenIdx];
    for ((acc, balance) in token.balances.vals()) {
      if (Principal.equal(acc, account)) return balance;
    };
    0
  };

  // Set balance for account in specific token
  private func setBalance(tokenIdx : Nat, account : Account, amount : Tokens) {
    let token = tokens[tokenIdx];
    
    // Find existing balance or create new entry
    var found = false;
    let newBalances = Array.tabulate<(Account, Tokens)>(
      token.balances.size(),
      func(i : Nat) : (Account, Tokens) {
        if (Principal.equal(token.balances[i].0, account)) {
          found := true;
          (account, amount)
        } else {
          token.balances[i]
        }
      }
    );
    
    let finalBalances = if (found) {
      newBalances
    } else {
      Array.append(newBalances, [(account, amount)])
    };

    let updatedToken = {
      id = token.id;
      metadata = token.metadata;
      balances = finalBalances;
      approvals = token.approvals;
    };

    tokens := Array.tabulate<Token>(tokens.size(), func(i : Nat) : Token {
      if (i == tokenIdx) updatedToken else tokens[i]
    });
  };

  // Transfer tokens between accounts
  private func transferTokens(tokenIdx : Nat, from : Account, to : Account, amount : Tokens) : Bool {
    let fromBalance = getBalance(tokenIdx, from);
    if (fromBalance < amount) return false;
    
    let toBalance = getBalance(tokenIdx, to);
    setBalance(tokenIdx, from, fromBalance - amount);
    setBalance(tokenIdx, to, toBalance + amount);
    true
  };

  //
  // Public User Management Functions
  //

  // Set user role (admin only)
  public shared ({ caller }) func set_user_role(user : Account, role : UserRole) : async Bool {
    if (not isAdmin(caller)) return false;
    
    let profile = getUserOrCreate(user);
    let updatedProfile = {
      principal = profile.principal;
      role = role;
      createdAt = profile.createdAt;
      lastActive = profile.lastActive;
      tokensCreated = profile.tokensCreated;
      isVerified = profile.isVerified;
    };
    userProfiles.put(user, updatedProfile);
    true
  };

  // Get user role
  public query func get_user_role(user : Account) : async ?UserRole {
    switch (userProfiles.get(user)) {
      case (?profile) ?profile.role;
      case null null;
    }
  };

  // Check if user is admin
  public query func is_admin(user : Account) : async Bool {
    isAdmin(user)
  };

  // Get user profile
  public query func get_user_profile(user : Account) : async ?UserProfile {
    userProfiles.get(user)
  };

  //
  // Public Token Functions
  //

  // Create a new token with role-based permissions
  public shared ({ caller }) func create_token(
    name : Text,
    symbol : Text,
    initial_supply : Tokens,
    decimals : Nat8,
    logo_url : ?Text
  ) : async Result.Result<TokenId, CreateTokenError> {
    
    // Update user activity
    updateUserActivity(caller);
    
    // Validation
    if (Principal.isAnonymous(caller)) {
      return #err(#AnonymousNotAllowed);
    };
    
    if (not hasCreatePermission(caller)) {
      return #err(#InsufficientPermissions);
    };
    
    if (not isValidName(name)) {
      return #err(#InvalidName);
    };
    
    if (not isValidSymbol(symbol)) {
      return #err(#InvalidSymbol);
    };
    
    if (initial_supply == 0) {
      return #err(#InvalidSupply);
    };
    
    // Create token metadata
    let metadata : TokenMetadata = {
      name = name;
      symbol = symbol;
      decimals = decimals;
      total_supply = initial_supply;
      minting_account = caller;
      logo_url = logo_url;
      description = null;
      created_at = Nat64.fromNat(Int.abs(Time.now()));
    };
    
    // Create token with initial balance for creator
    let newToken : Token = {
      id = nextTokenId;
      metadata = metadata;
      balances = if (initial_supply > 0) [(caller, initial_supply)] else [];
      approvals = [];
    };
    
    // Add to tokens array
    tokens := Array.append(tokens, [newToken]);
    let tokenId = nextTokenId;
    nextTokenId += 1;
    
    // Update user profile token count
    let profile = getUserOrCreate(caller);
    let updatedProfile = {
      principal = profile.principal;
      role = profile.role;
      createdAt = profile.createdAt;
      lastActive = profile.lastActive;
      tokensCreated = profile.tokensCreated + 1;
      isVerified = profile.isVerified;
    };
    userProfiles.put(caller, updatedProfile);
    
    #ok(tokenId)
  };

  // Get token metadata
  public query func token_metadata(tokenId : TokenId) : async ?(Text, Text, Nat8, ?Text) {
    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        let token = tokens[idx];
        ?(token.metadata.name, token.metadata.symbol, token.metadata.decimals, token.metadata.logo_url)
      };
      case null null;
    }
  };

  // Get complete token information
  public query func token_info(tokenId : TokenId) : async ?{
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Tokens;
    minting_account : Account;
    logo_url : ?Text;
  } {
    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        let token = tokens[idx];
        ?{
          name = token.metadata.name;
          symbol = token.metadata.symbol;
          decimals = token.metadata.decimals;
          total_supply = token.metadata.total_supply;
          minting_account = token.metadata.minting_account;
          logo_url = token.metadata.logo_url;
        }
      };
      case null null;
    }
  };

  // Get balance of account for specific token
  public query func balance_of(tokenId : TokenId, account : Account) : async Tokens {
    switch (findTokenIndex(tokenId)) {
      case (?idx) getBalance(idx, account);
      case null 0;
    }
  };

  // Get total supply of token
  public query func total_supply(tokenId : TokenId) : async Tokens {
    switch (findTokenIndex(tokenId)) {
      case (?idx) tokens[idx].metadata.total_supply;
      case null 0;
    }
  };

  // Transfer tokens from caller to recipient
  public shared ({ caller }) func transfer(
    tokenId : TokenId, 
    to : Account, 
    amount : Tokens
  ) : async Result.Result<Bool, TransferError> {
    
    updateUserActivity(caller);
    
    if (Principal.equal(caller, to)) {
      return #err(#SelfTransfer);
    };

    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        if (transferTokens(idx, caller, to, amount)) {
          #ok(true)
        } else {
          #err(#InsufficientBalance)
        }
      };
      case null #err(#TokenNotFound);
    }
  };

  // Get user's tokens (tokens they have balance in)
  public query func get_user_tokens(user : Account) : async [(TokenId, Tokens)] {
    var result : [(TokenId, Tokens)] = [];
    for (token in tokens.vals()) {
      let balance = getBalance_helper(token, user);
      if (balance > 0) {
        result := Array.append(result, [(token.id, balance)]);
      };
    };
    result
  };

  // Helper function for get_user_tokens
  private func getBalance_helper(token : Token, account : Account) : Tokens {
    for ((acc, balance) in token.balances.vals()) {
      if (Principal.equal(acc, account)) return balance;
    };
    0
  };

  //
  // Query Functions
  //

  // Get caller's principal
  public query (message) func whoami() : async Principal {
    message.caller
  };

  // Get all token IDs
  public query func all_tokens() : async [TokenId] {
    Array.map<Token, TokenId>(tokens, func(token : Token) : TokenId { token.id })
  };

  // Get platform statistics with role-based data
  public query func get_stats() : async {
    total_tokens : Nat;
    total_listings : Nat;
    active_listings : Nat;
    total_users : Nat;
    admin_count : Nat;
    creator_count : Nat;
  } {
    let active_count = Array.filter<Listing>(listings, func(l : Listing) : Bool { l.active }).size();
    var adminCount = 0;
    var creatorCount = 0;
    
    for ((principal, profile) in userProfiles.entries()) {
      switch (profile.role) {
        case (#Admin) adminCount += 1;
        case (#Creator) creatorCount += 1;
        case (#User) {};
      };
    };
    
    {
      total_tokens = tokens.size();
      total_listings = listings.size();
      active_listings = active_count;
      total_users = userProfiles.size();
      admin_count = adminCount;
      creator_count = creatorCount;
    }
  };

  // Get all users (admin only)
  public shared query ({ caller }) func get_all_users() : async ?[UserProfile] {
    if (not isAdmin(caller)) return null;
    
    ?Array.map<(Account, UserProfile), UserProfile>(
      Iter.toArray(userProfiles.entries()),
      func((principal, profile) : (Account, UserProfile)) : UserProfile { profile }
    )
  };
}

  //
  // Types
  //
  public type TokenId = Nat;
  public type Tokens = Nat;
  public type Account = Principal;

  // Enhanced error types for better error handling
  public type CreateTokenError = {
    #InvalidName;
    #InvalidSymbol;
    #InvalidSupply;
    #AnonymousNotAllowed;
    #InternalError : Text;
  };

  public type TransferError = {
    #TokenNotFound;
    #InsufficientBalance;
    #SelfTransfer;
    #InternalError : Text;
  };

  public type ApprovalError = {
    #TokenNotFound;
    #SelfApproval;
    #InternalError : Text;
  };

  // Approval record with expiration support
  public type Approval = {
    tokenId : TokenId;
    owner : Account;
    spender : Account;
    allowance : Tokens;
    expires_at : ?Nat64;
    created_at : Nat64;
  };

  // Enhanced token metadata
  public type TokenMetadata = {
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Tokens;
    minting_account : Account;
    logo_url : ?Text;
    description : ?Text;
    created_at : Nat64;
  };

  // Token with enhanced structure
  public type Token = {
    id : TokenId;
    metadata : TokenMetadata;
    balances : [(Account, Tokens)];
    approvals : [Approval];
  };

  // Marketplace listing
  public type Listing = {
    id : Nat;
    tokenId : TokenId;
    seller : Account;
    amount : Tokens;
    price_tokenId : TokenId;
    price_amount_per_token : Tokens;
    created_at : Nat64;
    active : Bool;
  };

  //
  // State
  //
  private stable var tokens : [Token] = [];
  private stable var listings : [Listing] = [];
  private stable var nextTokenId : TokenId = 0;
  private stable var nextListingId : Nat = 0;

  //
  // Helper Functions
  //

  // Validate text inputs
  private func isValidName(name : Text) : Bool {
    let size = Text.size(name);
    size >= 2 and size <= 50
  };

  private func isValidSymbol(symbol : Text) : Bool {
    let size = Text.size(symbol);
    size >= 2 and size <= 10
  };

  // Find token by ID
  private func findTokenIndex(id : TokenId) : ?Nat {
    var i : Nat = 0;
    for (token in tokens.vals()) {
      if (token.id == id) return ?i;
      i += 1;
    };
    null
  };

  // Get balance for account in specific token
  private func getBalance(tokenIdx : Nat, account : Account) : Tokens {
    let token = tokens[tokenIdx];
    for ((acc, balance) in token.balances.vals()) {
      if (Principal.equal(acc, account)) return balance;
    };
    0
  };

  // Set balance for account in specific token
  private func setBalance(tokenIdx : Nat, account : Account, amount : Tokens) {
    let token = tokens[tokenIdx];
    
    // Find existing balance or create new entry
    var found = false;
    let newBalances = Array.tabulate<(Account, Tokens)>(
      token.balances.size(),
      func(i : Nat) : (Account, Tokens) {
        if (Principal.equal(token.balances[i].0, account)) {
          found := true;
          (account, amount)
        } else {
          token.balances[i]
        }
      }
    );
    
    let finalBalances = if (found) {
      newBalances
    } else {
      Array.append(newBalances, [(account, amount)])
    };

    let updatedToken = {
      id = token.id;
      metadata = token.metadata;
      balances = finalBalances;
      approvals = token.approvals;
    };

    tokens := Array.tabulate<Token>(tokens.size(), func(i : Nat) : Token {
      if (i == tokenIdx) updatedToken else tokens[i]
    });
  };

  // Transfer tokens between accounts
  private func transferTokens(tokenIdx : Nat, from : Account, to : Account, amount : Tokens) : Bool {
    let fromBalance = getBalance(tokenIdx, from);
    if (fromBalance < amount) return false;
    
    let toBalance = getBalance(tokenIdx, to);
    setBalance(tokenIdx, from, fromBalance - amount);
    setBalance(tokenIdx, to, toBalance + amount);
    true
  };

  //
  // Public Token Functions
  //

  // Create a new token with enhanced validation
  public shared ({ caller }) func create_token(
    name : Text,
    symbol : Text,
    initial_supply : Tokens,
    decimals : Nat8,
    logo_url : ?Text
  ) : async Result.Result<TokenId, CreateTokenError> {
    
    // Validation
    if (Principal.isAnonymous(caller)) {
      return #err(#AnonymousNotAllowed);
    };
    
    if (not isValidName(name)) {
      return #err(#InvalidName);
    };
    
    if (not isValidSymbol(symbol)) {
      return #err(#InvalidSymbol);
    };
    
    if (initial_supply == 0) {
      return #err(#InvalidSupply);
    };
    
    // Create token metadata
    let metadata : TokenMetadata = {
      name = name;
      symbol = symbol;
      decimals = decimals;
      total_supply = initial_supply;
      minting_account = caller;
      logo_url = logo_url;
      description = null;
      created_at = Nat64.fromNat(Int.abs(Time.now()));
    };
    
    // Create token with initial balance for creator
    let newToken : Token = {
      id = nextTokenId;
      metadata = metadata;
      balances = if (initial_supply > 0) [(caller, initial_supply)] else [];
      approvals = [];
    };
    
    // Add to tokens array
    tokens := Array.append(tokens, [newToken]);
    let tokenId = nextTokenId;
    nextTokenId += 1;
    
    #ok(tokenId)
  };

  // Get token metadata
  public query func token_metadata(tokenId : TokenId) : async ?(Text, Text, Nat8, ?Text) {
    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        let token = tokens[idx];
        ?(token.metadata.name, token.metadata.symbol, token.metadata.decimals, token.metadata.logo_url)
      };
      case null null;
    }
  };

  // Get complete token information
  public query func token_info(tokenId : TokenId) : async ?{
    name : Text;
    symbol : Text;
    decimals : Nat8;
    total_supply : Tokens;
    minting_account : Account;
    logo_url : ?Text;
  } {
    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        let token = tokens[idx];
        ?{
          name = token.metadata.name;
          symbol = token.metadata.symbol;
          decimals = token.metadata.decimals;
          total_supply = token.metadata.total_supply;
          minting_account = token.metadata.minting_account;
          logo_url = token.metadata.logo_url;
        }
      };
      case null null;
    }
  };

  // Get balance of account for specific token
  public query func balance_of(tokenId : TokenId, account : Account) : async Tokens {
    switch (findTokenIndex(tokenId)) {
      case (?idx) getBalance(idx, account);
      case null 0;
    }
  };

  // Get total supply of token
  public query func total_supply(tokenId : TokenId) : async Tokens {
    switch (findTokenIndex(tokenId)) {
      case (?idx) tokens[idx].metadata.total_supply;
      case null 0;
    }
  };

  // Transfer tokens from caller to recipient
  public shared ({ caller }) func transfer(
    tokenId : TokenId, 
    to : Account, 
    amount : Tokens
  ) : async Result.Result<Bool, TransferError> {
    
    if (Principal.equal(caller, to)) {
      return #err(#SelfTransfer);
    };

    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        if (transferTokens(idx, caller, to, amount)) {
          #ok(true)
        } else {
          #err(#InsufficientBalance)
        }
      };
      case null #err(#TokenNotFound);
    }
  };

  // Approve spender to use tokens on behalf of caller
  public shared ({ caller }) func approve(
    tokenId : TokenId,
    spender : Account,
    allowance : Tokens
  ) : async Result.Result<Bool, ApprovalError> {
    
    if (Principal.equal(caller, spender)) {
      return #err(#SelfApproval);
    };

    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        let token = tokens[idx];
        
        // Find existing approval or create new one
        var found = false;
        let newApprovals = Array.tabulate<Approval>(
          token.approvals.size(),
          func(i : Nat) : Approval {
            let approval = token.approvals[i];
            if (approval.tokenId == tokenId and 
                Principal.equal(approval.owner, caller) and 
                Principal.equal(approval.spender, spender)) {
              found := true;
              {
                tokenId = approval.tokenId;
                owner = approval.owner;
                spender = approval.spender;
                allowance = allowance;
                expires_at = approval.expires_at;
                created_at = approval.created_at;
              }
            } else {
              approval
            }
          }
        );

        let finalApprovals = if (found) {
          newApprovals
        } else {
          Array.append(newApprovals, [{
            tokenId = tokenId;
            owner = caller;
            spender = spender;
            allowance = allowance;
            expires_at = null;
            created_at = Nat64.fromNat(Int.abs(Time.now()));
          }])
        };

        let updatedToken = {
          id = token.id;
          metadata = token.metadata;
          balances = token.balances;
          approvals = finalApprovals;
        };

        tokens := Array.tabulate<Token>(tokens.size(), func(i : Nat) : Token {
          if (i == idx) updatedToken else tokens[i]
        });

        #ok(true)
      };
      case null #err(#TokenNotFound);
    }
  };

  // Transfer tokens from owner to recipient using allowance
  public shared ({ caller }) func transferFrom(
    tokenId : TokenId,
    owner : Account,
    recipient : Account,
    amount : Tokens
  ) : async Result.Result<Bool, TransferError> {
    
    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        // If caller is owner, allow direct transfer
        if (Principal.equal(caller, owner)) {
          if (transferTokens(idx, owner, recipient, amount)) {
            return #ok(true);
          } else {
            return #err(#InsufficientBalance);
          }
        };

        // Check and update allowance
        let token = tokens[idx];
        var allowanceFound = false;
        var currentAllowance : Tokens = 0;
        
        for (approval in token.approvals.vals()) {
          if (approval.tokenId == tokenId and
              Principal.equal(approval.owner, owner) and
              Principal.equal(approval.spender, caller)) {
            allowanceFound := true;
            currentAllowance := approval.allowance;
          };
        };

        if (not allowanceFound or currentAllowance < amount) {
          return #err(#InsufficientBalance);
        };

        // Execute transfer
        if (not transferTokens(idx, owner, recipient, amount)) {
          return #err(#InsufficientBalance);
        };

        // Update allowance
        let newApprovals = Array.tabulate<Approval>(
          token.approvals.size(),
          func(i : Nat) : Approval {
            let approval = token.approvals[i];
            if (approval.tokenId == tokenId and
                Principal.equal(approval.owner, owner) and
                Principal.equal(approval.spender, caller)) {
              {
                tokenId = approval.tokenId;
                owner = approval.owner;
                spender = approval.spender;
                allowance = if (approval.allowance >= amount) {
                  approval.allowance - amount
                } else {
                  0
                };
                expires_at = approval.expires_at;
                created_at = approval.created_at;
              }
            } else {
              approval
            }
          }
        );

        let updatedToken = {
          id = token.id;
          metadata = token.metadata;
          balances = token.balances;
          approvals = newApprovals;
        };

        tokens := Array.tabulate<Token>(tokens.size(), func(i : Nat) : Token {
          if (i == idx) updatedToken else tokens[i]
        });

        #ok(true)
      };
      case null #err(#TokenNotFound);
    }
  };

  //
  // Marketplace Functions
  //

  // Create a listing to sell tokens
  public shared ({ caller }) func create_listing(
    tokenId : TokenId,
    amount : Tokens,
    price_tokenId : TokenId,
    price_amount_per_token : Tokens
  ) : async Result.Result<Nat, Text> {
    
    switch (findTokenIndex(tokenId)) {
      case (?idx) {
        let balance = getBalance(idx, caller);
        if (balance < amount) {
          return #err("Insufficient token balance to create listing");
        };

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
        let listingId = nextListingId;
        nextListingId += 1;
        #ok(listingId)
      };
      case null #err("Token not found");
    }
  };

  // Buy tokens from a listing
  public shared ({ caller }) func buy(
    listingId : Nat,
    amount_to_buy : Tokens
  ) : async Result.Result<Bool, Text> {
    
    // Find listing
    var listingIdx : ?Nat = null;
    var i : Nat = 0;
    for (listing in listings.vals()) {
      if (listing.id == listingId) {
        listingIdx := ?i;
      };
      i += 1;
    };

    switch (listingIdx) {
      case null #err("Listing not found");
      case (?idx) {
        let listing = listings[idx];
        
        if (not listing.active) {
          return #err("Listing is not active");
        };
        
        if (amount_to_buy > listing.amount) {
          return #err("Insufficient amount available in listing");
        };

        let total_price = amount_to_buy * listing.price_amount_per_token;

        // Transfer price tokens from buyer to seller
        switch (await transferFrom(listing.price_tokenId, caller, listing.seller, total_price)) {
          case (#err(_)) #err("Payment failed - ensure you have approved the marketplace and have sufficient funds");
          case (#ok(_)) {
            // Transfer sold tokens from seller to buyer
            switch (await transferFrom(listing.tokenId, listing.seller, caller, amount_to_buy)) {
              case (#err(_)) {
                // Try to refund buyer
                ignore await transfer(listing.price_tokenId, caller, total_price);
                #err("Token transfer failed - seller may not have approved marketplace")
              };
              case (#ok(_)) {
                // Update listing
                let newAmount = listing.amount - amount_to_buy;
                let updatedListing = {
                  id = listing.id;
                  tokenId = listing.tokenId;
                  seller = listing.seller;
                  amount = newAmount;
                  price_tokenId = listing.price_tokenId;
                  price_amount_per_token = listing.price_amount_per_token;
                  created_at = listing.created_at;
                  active = if (newAmount == 0) false else true;
                };

                listings := Array.tabulate<Listing>(listings.size(), func(j : Nat) : Listing {
                  if (j == idx) updatedListing else listings[j]
                });

                #ok(true)
              };
            }
          };
        }
      };
    }
  };

  // Cancel a listing
  public shared ({ caller }) func cancel_listing(listingId : Nat) : async Result.Result<Bool, Text> {
    var listingIdx : ?Nat = null;
    var i : Nat = 0;
    for (listing in listings.vals()) {
      if (listing.id == listingId) {
        listingIdx := ?i;
      };
      i += 1;
    };

    switch (listingIdx) {
      case null #err("Listing not found");
      case (?idx) {
        let listing = listings[idx];
        if (not Principal.equal(listing.seller, caller)) {
          return #err("Only seller can cancel listing");
        };

        let updatedListing = {
          id = listing.id;
          tokenId = listing.tokenId;
          seller = listing.seller;
          amount = listing.amount;
          price_tokenId = listing.price_tokenId;
          price_amount_per_token = listing.price_amount_per_token;
          created_at = listing.created_at;
          active = false;
        };

        listings := Array.tabulate<Listing>(listings.size(), func(j : Nat) : Listing {
          if (j == idx) updatedListing else listings[j]
        });

        #ok(true)
      };
    }
  };

  //
  // Query Functions
  //

  // Get caller's principal
  public query (message) func whoami() : async Principal {
    message.caller
  };

  // Get all token IDs
  public query func all_tokens() : async [TokenId] {
    Array.map<Token, TokenId>(tokens, func(token : Token) : TokenId { token.id })
  };

  // Get listing information
  public query func get_listing(listingId : Nat) : async ?Listing {
    for (listing in listings.vals()) {
      if (listing.id == listingId) return ?listing;
    };
    null
  };

  // Get all active listings
  public query func get_active_listings() : async [Listing] {
    Array.filter<Listing>(listings, func(listing : Listing) : Bool { listing.active })
  };

  // Get listings for a specific token
  public query func get_token_listings(tokenId : TokenId) : async [Listing] {
    Array.filter<Listing>(listings, func(listing : Listing) : Bool { 
      listing.active and listing.tokenId == tokenId 
    })
  };

  // Get user's tokens (tokens they have balance in)
  public query func get_user_tokens(user : Account) : async [(TokenId, Tokens)] {
    var result : [(TokenId, Tokens)] = [];
    for (token in tokens.vals()) {
      let balance = getBalance_helper(token, user);
      if (balance > 0) {
        result := Array.append(result, [(token.id, balance)]);
      };
    };
    result
  };

  // Helper function for get_user_tokens
  private func getBalance_helper(token : Token, account : Account) : Tokens {
    for ((acc, balance) in token.balances.vals()) {
      if (Principal.equal(acc, account)) return balance;
    };
    0
  };

  // Get platform statistics
  public query func get_stats() : async {
    total_tokens : Nat;
    total_listings : Nat;
    active_listings : Nat;
  } {
    let active_count = Array.filter<Listing>(listings, func(l : Listing) : Bool { l.active }).size();
    {
      total_tokens = tokens.size();
      total_listings = listings.size();
      active_listings = active_count;
    }
  };
}