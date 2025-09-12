import Principal "mo:base/Principal";

// persistent actor {
//   public query func greet(name : Text) : async Text {
//     return "Hello, " # name # "!";
//   };
// };



persistent actor Whoami {
  public query (message) func whoami() : async Principal {
    message.caller;
  };
};
