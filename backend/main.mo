import Text "mo:base/Text";

import Principal "mo:base/Principal";

actor {
  public shared(msg) func whoami() : async Principal {
    if (Principal.isAnonymous(msg.caller)) {
      Principal.fromText("2vxsx-fae") // Default unauthenticated principal
    } else {
      msg.caller
    }
  };
};
