var Splitter = artifacts.require('Splitter');

contract('Splitter', function(accounts) {
    let catchRevert = require("./exceptions.js").catchRevert;

    let alice = accounts[0];
    let bob = accounts[1];
    let carol = accounts[2];
    var contract;

    beforeEach(function() {
      return Splitter.new().then(function(instance) {
        contract = instance;
      });
    });

    it('should have the owner address equal to the sender', async function() {
        let contractOwner = await contract.owner.call();
        assert.equal(contractOwner, alice);
    });

    it('should not split if there is no recipients', async function() {
        await catchRevert(contract.split({
            from: alice,
            value: web3.toWei(1, "ether")
        }));
    });

    it('should not remove recipient if there is no recipients', async function() {
        await catchRevert(contract.removeRecipient(bob, {from: alice}));
    });

    it('should not add recipient by other', async function() {
        await catchRevert(contract.addRecipient(bob, {from: bob}));
    });

    it('should add recipient by owner', async function() {
        let events = await contract.addRecipient(bob, {from: alice});
        assert.equal(events.logs.length, 1);
        assert.equal(events.logs[0].event, 'LogAddRecipient');
        assert.equal(events.logs[0].args.sender, alice);
        assert.equal(events.logs[0].args.recipient, bob);
        events = await contract.addRecipient(carol, {from: alice});
        assert.equal(events.logs.length, 1);
        assert.equal(events.logs[0].event, 'LogAddRecipient');
        assert.equal(events.logs[0].args.sender, alice);
        assert.equal(events.logs[0].args.recipient, carol);
        let contractRecipients = await contract.getRecipients({from: alice});
        assert.equal(bob, contractRecipients[0]);
        assert.equal(carol, contractRecipients[1]);
    });

    it('should not remove recipient by other', async function() {
        await catchRevert(contract.removeRecipient(bob, {from: bob}));
    });

    it('should not split by other', async function() {
        await catchRevert(contract.split({
            from: bob,
            value: web3.toWei(1, "ether")
        }));
    });

    it('should split by owner', async function() {
        // prepare
        await contract.addRecipient(bob, {from: alice});
        await contract.addRecipient(carol, {from: alice});

        let events = await contract.split({
            from: alice,
            value: web3.toWei(1, "ether")
        });
        assert.equal(events.logs.length, 1);
        assert.equal(events.logs[0].event, 'LogSplit');
        assert.equal(events.logs[0].args.sender, alice);
        assert.equal(events.logs[0].args.value, web3.toWei(1, "ether"));
        let contractEther = await web3.eth.getBalance(contract.address);
        assert.equal(contractEther, web3.toWei(1, "ether"));
        let splitValue = web3.toWei(1, "ether") / 2;
        let bobBlance = await contract.balanceOf(bob, {from: alice});
        let carolBlance = await contract.balanceOf(carol, {from: alice});
        assert.equal(bobBlance, splitValue);
        assert.equal(carolBlance, splitValue);
        events = await contract.split({
            from: alice,
            value: 3
        });
        assert.equal(events.logs.length, 1);
        assert.equal(events.logs[0].event, 'LogSplit');
        assert.equal(events.logs[0].args.sender, alice);
        assert.equal(events.logs[0].args.value, 3);
        contractEther = await web3.eth.getBalance(contract.address);
        assert.equal(contractEther, web3.toWei(1, "ether")/1+3);
        aliceBlance = await contract.balanceOf(alice, {from: alice});
        bobBlance = await contract.balanceOf(bob, {from: alice});
        carolBlance = await contract.balanceOf(carol, {from: alice});
        assert.equal(aliceBlance, 1);
        assert.equal(bobBlance, splitValue+1);
        assert.equal(carolBlance, splitValue+1);
    });

    it('should remove recipient by owner', async function() {
        // prepare
        await contract.addRecipient(bob, {from: alice});
        await contract.addRecipient(carol, {from: alice});
        await contract.split({
            from: alice,
            value: web3.toWei(1, "ether")
        });
        await contract.split({
            from: alice,
            value: 3
        });

        let previousBobEther = await web3.eth.getBalance(bob);
        let events = await contract.removeRecipient(bob, {from: alice});
        assert.equal(events.logs.length, 2);
        assert.equal(events.logs[0].event, 'LogWithdraw');
        assert.equal(events.logs[0].args.sender, alice);
        assert.equal(events.logs[0].args.recipient, bob);
        assert.equal(events.logs[0].args.toWithdraw, web3.toWei(1, "ether")/2+1);
        assert.equal(events.logs[1].event, 'LogRemoveRecipient');
        assert.equal(events.logs[1].args.sender, alice);
        assert.equal(events.logs[1].args.recipient, bob);
        let contractRecipients = await contract.getRecipients({from: alice});
        assert.equal(carol, contractRecipients[0]);
        currentBobEther = await web3.eth.getBalance(bob);
        assert.equal(currentBobEther-previousBobEther, web3.toWei(1, "ether")/2+1);
    });

    it('should withdraw balance', async function() {
        // prepare
        await contract.addRecipient(bob, {from: alice});
        await contract.addRecipient(carol, {from: alice});
        await contract.split({
            from: alice,
            value: web3.toWei(1, "ether")
        });
        await contract.split({
            from: alice,
            value: 3
        });

        let previousCarolEther = await web3.eth.getBalance(carol);
        let events = await contract.withdraw(carol, {from: alice});
        assert.equal(events.logs.length, 1);
        assert.equal(events.logs[0].event, 'LogWithdraw');
        assert.equal(events.logs[0].args.sender, alice);
        assert.equal(events.logs[0].args.recipient, carol);
        assert.equal(events.logs[0].args.toWithdraw, web3.toWei(1, "ether")/2+1);
        currentCarolEther = await web3.eth.getBalance(carol);
        assert.equal(currentCarolEther-previousCarolEther, web3.toWei(1, "ether")/2+1);
    });
});