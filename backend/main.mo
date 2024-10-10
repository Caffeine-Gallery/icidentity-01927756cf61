import Text "mo:base/Text";

import Principal "mo:base/Principal";

actor Self {
  public query func whoami() : async Principal {
    let caller = Principal.fromActor(Self);
    if (Principal.isAnonymous(caller)) {
      Principal.fromText("2vxsx-fae") // Anonymous principal
    } else {
      caller
    }
  };
};
