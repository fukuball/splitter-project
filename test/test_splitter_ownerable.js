var Splitter = artifacts.require('Splitter');

contract('Splitter', function(accounts) {
    it('should have the owner address equal to the sender', function() {
        var contract;
        var originalOwner = accounts[0];
        Splitter.deployed().then((instance) => {
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
        Splitter.deployed().then((instance) => {
            contract = instance;
            contract.changeOwner(newOwner, {from: originalOwner});
        }).then(() => {
            assert.equal(contract.owner.call(), newOwner);
            utils.assertEvent(contract, {
                event: "LogChangeOwner",
                logIndex: 0,
                args: {
                    sender: originalOwner,
                    newOwner: newOwner
                }
            });
        });
    });
});