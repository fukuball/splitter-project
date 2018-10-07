var Splitter = artifacts.require('Splitter');

contract('Splitter', function(accounts) {
    it('should have the owner address equal to the sender', function() {
        var contract;
        var originalOwner = accounts[0];
        return Splitter.deployed().then((instance) => {
            contract = instance;
            return contract.owner.call();
        }).then((owner) => {
            assert.equal(owner, originalOwner);
        });
    });

    it('should have the ability to change owner and get the event', function() {
        var contract;
        var originalOwner = accounts[0];
        var newOwner = accounts[1];
        return Splitter.deployed().then((instance) => {
            contract = instance;
            return contract.changeOwner(newOwner, {from: originalOwner});
        }).then((events) => {
            assert.equal(events.logs.length, 1);
            assert.equal(events.logs[0].event, 'LogChangeOwner');
            assert.equal(events.logs[0].args.sender, originalOwner);
            assert.equal(events.logs[0].args.newOwner, newOwner);
            return contract.owner.call();
        }).then((owner) => {
            assert.equal(owner, newOwner);
        });
    });
});