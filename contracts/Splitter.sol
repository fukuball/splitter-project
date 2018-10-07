pragma solidity ^0.4.23;

import "./Ownerable.sol";

contract Splitter is Ownerable {

    mapping(address => uint256) balances;
    address[] public recipients;

    event LogSplit(address sender, uint256 value);
    event LogAddRecipient(address sender, address recipient);
    event LogRemoveRecipient(address sender, address recipient);
    event LogWithdraw(address sender, address recipient, uint toWithdraw);

    constructor() public {
        balances[msg.sender] = 0;
    }

    function split() onlyOwner payable public returns(bool isSuccess) {
        uint numberOfRecipients = recipients.length;
        require(numberOfRecipients > 0);

        uint256 remainder = msg.value % numberOfRecipients;
        uint256 splitValue = (msg.value - remainder) / numberOfRecipients;

        balances[msg.sender] += remainder;

        for (uint i=0; i < numberOfRecipients; i++) {
            balances[recipients[i]] += splitValue;
        }

        emit LogSplit(msg.sender, msg.value);

        return true;
    }

    function addRecipient(address recipient) onlyOwner public returns(address[]) {
        (bool isExist, uint recipientIndex) = findRecipient(recipient);
        require(isExist == false && recipientIndex == 0);

        recipients.push(recipient);
        balances[recipient] = 0;

        emit LogAddRecipient(msg.sender, recipient);

        return recipients;
    }

    function removeRecipient(address recipient) onlyOwner public returns(address[]) {
        (bool isExist, uint recipientIndex) = findRecipient(recipient);
        require(isExist == true);

        if (balances[recipient] > 0) {
            withdraw(recipient);
        }
        delete balances[recipient];
        recipients[recipientIndex] = recipients[recipients.length-1];
        recipients.length--;

        emit LogRemoveRecipient(msg.sender, recipient);

        return recipients;
    }

    function withdraw(address recipient) public returns(bool isSuccess) {
        uint toWithdraw = balances[recipient];
        require(toWithdraw > 0);
        balances[recipient] = 0;
        recipient.transfer(toWithdraw);

        emit LogWithdraw(msg.sender, recipient, toWithdraw);

        return true;
    }

    function findRecipient(address recipient) private view returns (bool, uint) {
        uint numberOfRecipients = recipients.length;
        bool isExist = false;
        uint recipientIndex = 0;

        for (uint i=0; i < numberOfRecipients; i++) {
            if(recipients[i] == recipient) {
                isExist = true;
                recipientIndex = i;
                break;
            }
        }

        return (isExist, recipientIndex);
    }

    function balanceOf(address recipient) public view returns(uint256) {
        return balances[recipient];
    }

    function getRecipients() public view returns(address[]) {
        return recipients;
    }
}