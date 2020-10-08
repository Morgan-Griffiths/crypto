pragma solidity >=0.4.22 <0.8.0;

contract HelloWorldContract {
  string greeting;
  constructor() public {
    greeting = 'Hello World';
  }
    function greet() public view returns (string memory) {
      return greeting;
    }
}