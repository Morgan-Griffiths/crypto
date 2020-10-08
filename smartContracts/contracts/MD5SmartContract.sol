// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract MD5SmartContract {
  bytes32 public signature;
  event signEvent(bytes32 signature);
  constructor() public {
  }
  function sign(string memory document) public {
    signature = sha256(bytes(document));
    emit signEvent(signature);
  }
}
