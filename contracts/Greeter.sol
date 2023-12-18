// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


contract Greeter {
    address private owner;
    bytes32 public message;
    uint8 private owners = 0;
    uint8 private updates = 0;

    constructor(bytes32 _message) {
        owner = msg.sender;
        owners++;
        message = _message;
    }

    function claim() public payable {
        require(msg.sender != owner, 'You already own the greeter');
        require(owners < 5, 'Max owners reached');

        owner = msg.sender;
        owners++;
    }

    function setMessage(bytes32 _message) public {
        require(msg.sender == owner, 'You are not the owner');
        require(updates < 10, 'Max update count reached');
        require(_message != message, "The message can't be the same");

        message = _message;
        updates++;
    }
}