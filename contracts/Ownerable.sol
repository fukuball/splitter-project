pragma solidity ^0.4.23;

/**
 * Ownerable
 *
 * ownerable contract makes contracs ownerable,
 * provide the only owner modifier for the contracts iheratance it.
 *
 * properties address owner
 */
contract Ownerable {

    address public owner;

    event LogChangeOwner(address sender, address newOwner);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier preventSameOwner(address newOwner) {
        require(msg.sender != newOwner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function changeOwner(address newOwner) public onlyOwner preventSameOwner(newOwner) returns(bool isSuccess) {
        owner = newOwner;
        emit LogChangeOwner(msg.sender, newOwner);
        return true;
    }
}