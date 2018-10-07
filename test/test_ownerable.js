var Ownerable = artifacts.require('Ownerable');

contract('Ownerable', function(accounts) {
    let catchRevert = require("./exceptions.js").catchRevert;

    it('should have the owner address equal to the sender', async function() {
        let originalOwner = accounts[0];
        let contract = await Ownerable.deployed();
        let contractOwner = await contract.owner.call();
        assert.equal(contractOwner, originalOwner);
    });

    it('should not change owner with original owner address', async function() {
        let originalOwner = accounts[0];
        let contract = await Ownerable.deployed();
        await catchRevert(contract.changeOwner(originalOwner, {from: originalOwner}));
    });

    it('should not change owner by not owner', async function() {
        let originalOwner = accounts[0];
        let other = accounts[1];
        let contract = await Ownerable.deployed();
        await catchRevert(contract.changeOwner(other, {from: other}));
    });

    it('should have the ability to change owner and get the event', async function() {
        let originalOwner = accounts[0];
        let newOwner = accounts[1];
        let contract = await Ownerable.deployed();
        let events = await contract.changeOwner(newOwner, {from: originalOwner});
        assert.equal(events.logs.length, 1);
        assert.equal(events.logs[0].event, 'LogChangeOwner');
        assert.equal(events.logs[0].args.sender, originalOwner);
        assert.equal(events.logs[0].args.newOwner, newOwner);
        let contractOwner = await contract.owner.call();
        assert.equal(contractOwner, newOwner);
    });
});