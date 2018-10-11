const expectedExceptionPromise = require("./expected_exception_testRPC_and_geth.js");
const Splitter = artifacts.require('Splitter');
const BigNumber = web3.BigNumber;

contract('Splitter', function(accounts) {

    const alice = accounts[0];
    const bob = accounts[1];
    const carol = accounts[2];
    var splitterContract;

    beforeEach(function() {
      return Splitter.new({from: alice}).then(function(instance) {
        splitterContract = instance;
      });
    });

    it('should have the owner address equal to the sender', async function() {
        const contractOwner = await splitterContract.getOwner({from: alice});
        assert.strictEqual(contractOwner, alice);
    });

    it('should not split if two recipients are the same', async function() {
        await expectedExceptionPromise(function () {
            return splitterContract.split(bob, bob, {
                from: alice,
                value: web3.toWei(1, "ether")
            });
        }, 3000000);
    });

    it('should split by owner', async function() {

        const previousBobBalance = await splitterContract.balanceOf(bob);
        const previousCarolBalance = await splitterContract.balanceOf(carol);

        const txObj1 = await splitterContract.split(
            bob, carol,
            {
                from: alice,
                value: 1024
            });
        assert.strictEqual(txObj1.receipt.logs.length, 1);
        assert.strictEqual(txObj1.logs.length, 1);
        assert.strictEqual(txObj1.logs[0].event, 'LogSplit');
        assert.strictEqual(txObj1.logs[0].args.sender, alice);
        assert.strictEqual(txObj1.logs[0].args.firstRecipient, bob);
        assert.strictEqual(txObj1.logs[0].args.secondRecipient, carol);
        assert.strictEqual(txObj1.logs[0].args.value.toString(10), "1024");
        let contractEther = web3.eth.getBalance(splitterContract.address);
        assert.strictEqual(contractEther.toString(10), "1024");

        const currentBobBalance1 = await splitterContract.balanceOf(bob);
        const currentCarolBalance1 = await splitterContract.balanceOf(carol);

        assert.strictEqual(currentBobBalance1.minus(previousBobBalance).toString(10), "512");
        assert.strictEqual(currentCarolBalance1.minus(previousCarolBalance).toString(10) , "512");

        const txObj2 = await splitterContract.split(
            bob, carol,
            {
                from: alice,
                value: 3
            });
        assert.strictEqual(txObj2.receipt.logs.length, 1);
        assert.strictEqual(txObj2.logs.length, 1);
        assert.strictEqual(txObj2.logs[0].event, 'LogSplit');
        assert.strictEqual(txObj2.logs[0].args.sender, alice);
        assert.strictEqual(txObj2.logs[0].args.firstRecipient, bob);
        assert.strictEqual(txObj2.logs[0].args.secondRecipient, carol);
        assert.strictEqual(txObj2.logs[0].args.value.toString(10), "3");
        contractEther = web3.eth.getBalance(splitterContract.address);
        assert.strictEqual(contractEther.toString(10), "1027");

        const currentBobBalance2 = await splitterContract.balanceOf(bob);
        const currentCarolBalance2 = await splitterContract.balanceOf(carol);

        assert.strictEqual(currentBobBalance2.minus(currentBobBalance1).toString(10), "1");
        assert.strictEqual(currentCarolBalance2.minus(currentCarolBalance1).toString(10), "1");
    });

    it('should withdraw balance', async function() {

        let previousContractEther = web3.eth.getBalance(splitterContract.address);
        await splitterContract.split(
            bob, carol,
            {
                from: alice,
                value: 1024
            });
        await splitterContract.split(
            bob, carol,
            {
                from: alice,
                value: 3
            });

        const previousCarolEther = web3.eth.getBalance(carol);
        const txObj = await splitterContract.withdraw({from: carol});
        assert.strictEqual(txObj.receipt.logs.length, 1);
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, 'LogWithdraw');
        assert.strictEqual(txObj.logs[0].args.sender, carol);
        assert.strictEqual(txObj.logs[0].args.toWithdraw.toString(10), "513");
        const currentCarolEther = web3.eth.getBalance(carol);
        const gasUsed = new BigNumber(txObj.receipt.gasUsed).times(100000000000);
        assert.strictEqual(previousCarolEther.minus(gasUsed).plus(513).toString(10), currentCarolEther.toString(10));
        currentContractEther = web3.eth.getBalance(splitterContract.address);
        assert.strictEqual(currentContractEther.minus(previousContractEther).toString(10), "514");

        const carolBalance = await splitterContract.balanceOf(carol);
        assert.strictEqual(carolBalance.toString(10), "0");
    });
});