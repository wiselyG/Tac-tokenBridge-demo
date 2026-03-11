// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;


contract SimpleMessage {
    event MessageReceived(string message, address sender);
    
    // Store the last message received
    string public lastMessage;
    address public lastSender;
    
    function setMessage(string memory _message) public {
        lastMessage = _message;
        lastSender = msg.sender;
        emit MessageReceived(_message, msg.sender);
    }
    
    function getMessage() public view returns (string memory, address) {
        return (lastMessage, lastSender);
    }
}