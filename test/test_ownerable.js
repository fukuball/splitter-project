const catchRevert = require("./exceptions.js").catchRevert;
const Ownerable = artifacts.require('Ownerable');

contract('Ownerable', function(accounts) {

    const originalOwner = accounts[0];
    var contract;

    beforeEach(function() {
      return Ownerable.new({from: originalOwner}).then(function(instance) {
        contract = instance;
      });
    });

    it('should have the owner address equal to the sender', async function() {
        const contractOwner = await contract.owner({from: originalOwner});
        assert.equal(contractOwner, originalOwner);
    });

    it('should not change owner with original owner address', async function() {
        await catchRevert(contract.changeOwner(originalOwner, {from: originalOwner}));
    });

    it('should not change owner by not owner', async function() {
        const other = accounts[1];
        await catchRevert(contract.changeOwner(other, {from: other}));
    });

    it('should have the ability to change owner and get the event', async function() {
        const newOwner = accounts[1];
        const txObj = await contract.changeOwner(newOwner, {from: originalOwner});
        assert.equal(txObj.receipt.logs.length, 1);
        assert.equal(txObj.logs.length, 1);
        assert.equal(txObj.logs[0].event, 'LogChangeOwner');
        assert.equal(txObj.logs[0].args.sender, originalOwner);
        assert.equal(txObj.logs[0].args.newOwner, newOwner);
        const contractOwner = await contract.owner({from: originalOwner});
        assert.equal(contractOwner, newOwner);
    });
});