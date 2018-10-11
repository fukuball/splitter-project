const expectedExceptionPromise = require("./expected_exception_testRPC_and_geth.js");
const Splitter = artifacts.require('Splitter');

contract('Splitter', function(accounts) {

    const alice = accounts[0];
    const bob = accounts[1];
    const carol = accounts[2];
    var contract;

    beforeEach(function() {
      return Splitter.new({from: alice}).then(function(instance) {
        contract = instance;
      });
    });

    it('should have the owner address equal to the sender', async function() {
        const contractOwner = await contract.getOwner({from: alice});
        assert.strictEqual(contractOwner, alice);
    });

    it('should not split if there is no recipients', async function() {
        await expectedExceptionPromise(function () {
            return contract.split([], {
                from: alice,
                value: web3.toWei(1, "ether")
            });
        }, 3000000);
    });

    it('should not split if there is too many recipients', async function() {
        await expectedExceptionPromise(function () {
            return contract.split([
                    accounts[1],
                    accounts[2],
                    accounts[3],
                    accounts[4],
                    accounts[5],
                    accounts[6],
                ], {
                from: alice,
                value: web3.toWei(1, "ether")
            });
        }, 3000000);
    });

    it('should split by owner', async function() {

        const previousBobEther = await web3.eth.getBalance(bob);
        const previousCarolEther = await web3.eth.getBalance(carol);

        const txObj1 = await contract.split(
            [bob, carol],
            {
                from: alice,
                value: web3.toWei(1, "ether")
            });
        assert.strictEqual(txObj1.receipt.logs.length, 1);
        assert.strictEqual(txObj1.logs.length, 1);
        assert.strictEqual(txObj1.logs[0].event, 'LogSplit');
        assert.strictEqual(txObj1.logs[0].args.sender, alice);
        assert.strictEqual(txObj1.logs[0].args.value.toString(10), web3.toWei(1, "ether"));

        const currentBobEther1 = await web3.eth.getBalance(bob);
        const currentCarolEther1 = await web3.eth.getBalance(carol);

        assert.strictEqual(currentBobEther1.minus(previousBobEther).toString(10), "500000000000000000");
        assert.strictEqual(currentCarolEther1.minus(previousCarolEther).toString(10) , "500000000000000000");

        const txObj2 = await contract.split(
            [bob, carol],
            {
                from: alice,
                value: "3"
            });
        assert.strictEqual(txObj2.receipt.logs.length, 1);
        assert.strictEqual(txObj2.logs.length, 1);
        assert.strictEqual(txObj2.logs[0].event, 'LogSplit');
        assert.strictEqual(txObj2.logs[0].args.sender, alice);
        assert.strictEqual(txObj2.logs[0].args.value.toString(10), "3");

        const currentBobEther2 = await web3.eth.getBalance(bob);
        const currentCarolEther2 = await web3.eth.getBalance(carol);

        assert.strictEqual(currentBobEther2.minus(currentBobEther1).toString(10), "1");
        assert.strictEqual(currentCarolEther2.minus(currentCarolEther1).toString(10), "1");
    });
});