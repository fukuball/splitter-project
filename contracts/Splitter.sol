pragma solidity ^0.4.23;

import "./Ownerable.sol";

contract Splitter is Ownerable {

    mapping(address => uint256) balances;

    event LogSplit(address indexed sender, address indexed firstRecipient,  address indexed secondRecipient, uint256 value);
    event LogWithdraw(address indexed sender, uint toWithdraw);

    constructor() public {
    }

    function split(address firstRecipient, address secondRecipient) payable public returns(bool isSuccess) {
        require(firstRecipient != address(0), "prevent address 0");
        require(secondRecipient != address(0), "prevent address 0");
        require(firstRecipient != secondRecipient, "prevent same recipients");
        require(msg.value > 0, "prevent 0 value to split");
        uint256 remainder = msg.value % 2;
        uint256 splitValue = (msg.value - remainder) / 2;

        balances[firstRecipient] += splitValue;
        balances[secondRecipient] += splitValue;
        if (remainder > 0) {
            balances[msg.sender] += remainder;
        }

        emit LogSplit(msg.sender, firstRecipient, secondRecipient, msg.value);

        return true;
    }

    function withdraw() public returns(bool isSuccess) {
        uint256 toWithdraw = balances[msg.sender];
        require(toWithdraw > 0, "no balance");
        balances[msg.sender] = 0;
        msg.sender.transfer(toWithdraw);
        emit LogWithdraw(msg.sender, toWithdraw);
        return true;
    }

    function balanceOf(address recipient) public view returns(uint256) {
        return balances[recipient];
    }
}