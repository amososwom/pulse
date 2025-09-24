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

  // User profile with role management
  public type UserProfile = {
    principal : Account;
    role : UserRole;
    createdAt : Nat64;
    lastActive : Nat64;
    tokensCreated : Nat;
    isVerified : Bool;
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
  };

  //
  // Stable State Variables
  //
  stable var tokens : [Token] = [];
  stable var userProfilesStable : [(Account, UserProfile)] = [];
  stable var adminPrincipals : [Account] = [];
  stable var nextTokenId : TokenId = 0;
  
  // Non-stable HashMap for efficient runtime operations - explicitly marked as transient
  transient var userProfiles = HashMap.HashMap<Account, UserProfile>(10, Principal.equal, Principal.hash);

  // Initialize with admin principals
  private func initializeAdmins() {
    // Add your admin principals here - replace with actual principals
    adminPrincipals := [
      Principal.fromText("5lkc7-dhp5b-2wer7-qwazf-aqtpz-acnwi-sdkwh-ekpjw-lza2u-5qa6m-sae"),
      // Principal.fromText("your-admin-principal-2")
    ];
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

  // Allow all users to create tokens - open platform approach
  private func hasCreatePermission(principal : Account) : Bool {
    // For an open creator platform, everyone can create tokens
    true
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
        Debug.print("Created new user profile for: " # Principal.toText(principal));
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

  // Helper function for get_user_tokens
  private func getBalance_helper(token : Token, account : Account) : Tokens {
    for ((acc, balance) in token.balances.vals()) {
      if (Principal.equal(acc, account)) return balance;
    };
    0
  };

  //
  // Public User Management Functions
  //

  // Initialize/register user (call after Internet Identity login)
  public shared ({ caller }) func initialize_user() : async UserProfile {
    Debug.print("Initializing user: " # Principal.toText(caller));
    
    // Validate caller is not anonymous
    if (Principal.isAnonymous(caller)) {
      Debug.print("Anonymous caller attempted to initialize");
      // Return a default error profile or throw error
      // For now, we'll create a profile but this shouldn't happen in real use
    };
    
    // This will create the user profile if it doesn't exist
    updateUserActivity(caller);
    let profile = getUserOrCreate(caller);
    
    Debug.print("User initialized with role: " # (
      switch (profile.role) {
        case (#Admin) "Admin";
        case (#Creator) "Creator";  
        case (#User) "User";
      }
    ));
    
    profile
  };

  // Get or initialize user profile (safer version)
  public shared ({ caller }) func get_or_create_profile() : async UserProfile {
    updateUserActivity(caller);
    getUserOrCreate(caller)
  };

  // Simple ping function for testing connectivity and creating user profile
  public shared ({ caller }) func ping() : async Bool {
    Debug.print("Ping from: " # Principal.toText(caller));
    updateUserActivity(caller);
    ignore getUserOrCreate(caller);
    true
  };

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
      balances = [(caller, initial_supply)];
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
    
    Debug.print("Token created with ID: " # Nat.toText(tokenId) # " by " # Principal.toText(caller));
    
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
    total_users : Nat;
    admin_count : Nat;
    creator_count : Nat;
  } {
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

  // Debug function to check if user exists
  public query func user_exists(user : Account) : async Bool {
    switch (userProfiles.get(user)) {
      case (?_) true;
      case null false;
    }
  };

  // Debug function to get user count
  public query func get_user_count() : async Nat {
    userProfiles.size()
  };
}