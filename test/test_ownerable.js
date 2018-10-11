const expectedExceptionPromise = require("./expected_exception_testRPC_and_geth.js");
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
        const contractOwner = await contract.getOwner({from: originalOwner});
        assert.equal(contractOwner, originalOwner);
    });

    it('should not change owner with original owner address', async function() {
        await expectedExceptionPromise(function () {
            return contract.changeOwner(originalOwner, {from: originalOwner});
        }, 3000000);
    });

    it('should not change owner by not owner', async function() {
        const other = accounts[1];
        await expectedExceptionPromise(function () {
            return contract.changeOwner(other, {from: other});
        }, 3000000);
    });

    it('should have the ability to change owner and get the event', async function() {
        const newOwner = accounts[1];
        const txObj = await contract.changeOwner(newOwner, {from: originalOwner});
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, 'LogChangeOwner');
        assert.strictEqual(txObj.logs[0].args.sender, originalOwner);
        assert.strictEqual(txObj.logs[0].args.newOwner, newOwner);
        const contractOwner = await contract.getOwner({from: originalOwner});
        assert.strictEqual(contractOwner, newOwner);
    });
});