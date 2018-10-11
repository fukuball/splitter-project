pragma solidity ^0.4.23;

import "./Ownerable.sol";

contract Splitter is Ownerable {

    event LogSplit(address sender, uint256 value);

    constructor() public {
    }

    function split(address[] recipients) onlyOwner payable public returns(bool isSuccess) {
        uint numberOfRecipients = recipients.length;
        require(numberOfRecipients > 0, "no recipients");
        require(numberOfRecipients <= 5, "too many recipients");

        uint256 remainder = msg.value % numberOfRecipients;
        uint256 splitValue = (msg.value - remainder) / numberOfRecipients;

        for (uint i=0; i < numberOfRecipients; i++) {
            recipients[i].transfer(splitValue);
        }
        if (remainder > 0) {
            msg.sender.transfer(remainder);
        }

        emit LogSplit(msg.sender, msg.value);

        return true;
    }
}