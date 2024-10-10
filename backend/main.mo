import Principal "mo:base/Principal";

actor {
  public shared (message) func whoami() : async Principal {
    return message.caller;
  };
};
