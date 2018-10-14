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

    address private _owner;

    event LogChangeOwner(address indexed sender, address indexed newOwner);

    modifier onlyOwner {
        require(msg.sender == _owner, "only owner");
        _;
    }

    modifier preventSameOwner(address newOwner) {
        require(owner != newOwner, "prevent same owner");
        _;
    }

    constructor() public {
        _owner = msg.sender;
    }

    function getOwner() public view returns(address) {
        return _owner;
    }

    function changeOwner(address newOwner) public onlyOwner preventSameOwner(newOwner) returns(bool isSuccess) {
        require(newOwner != address(0));
        _owner = newOwner;
        emit LogChangeOwner(msg.sender, newOwner);
        return true;
    }
}