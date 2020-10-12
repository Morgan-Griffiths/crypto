// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GLDToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Gold", "GLD") {
        _mint(msg.sender, initialSupply);
    }
    function name() public view returns (string) {
        return 'Ponzi';
    }
    function symbol() public view returns(string) {
        return 'PZI';
    }
    function balanceOf(address _owner) public view returns(uint256 balance) {
        return b
    }
}