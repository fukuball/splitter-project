const expectedExceptionPromise = require("./expected_exception_testRPC_and_geth.js");
const Splitter = artifacts.require('Splitter');
const Promise = require("bluebird");
const BigNumber = web3.BigNumber;

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract('Splitter', function(accounts) {

    const alice = accounts[0];
    const bob = accounts[1];
    const carol = accounts[2];
    let splitterContract;

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

    describe("split...", function() {

        const splitValueSet = [
            {   sent:          "1024",
                aliceBalance:     "0",
                bobBalance:     "512",
                carolBalance:   "512",
                contractEther: "1024"
            },
            {   sent:             "3",
                aliceBalance:     "1",
                bobBalance:       "1",
                carolBalance:     "1",
                contractEther:    "3"
            },
        ];

        splitValueSet.forEach((values, index) => {
            it('should split half/half to two recipients on set ' + index, async function() {
                const txObj = await splitterContract.split(
                    bob, carol,
                    {
                        from: alice,
                        value: values.sent
                    });
                assert.strictEqual(txObj.receipt.logs.length, 1);
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, 'LogSplit');
                assert.strictEqual(txObj.logs[0].args.sender, alice);
                assert.strictEqual(txObj.logs[0].args.firstRecipient, bob);
                assert.strictEqual(txObj.logs[0].args.secondRecipient, carol);
                assert.strictEqual(txObj.logs[0].args.value.toString(10), values.sent);
                const contractEther = await web3.eth.getBalancePromise(splitterContract.address);
                assert.strictEqual(contractEther.toString(10), values.contractEther);

                const currentBobBalance = await splitterContract.balanceOf(bob);
                const currentCarolBalance = await splitterContract.balanceOf(carol);

                assert.strictEqual(currentBobBalance.toString(10), values.bobBalance);
                assert.strictEqual(currentCarolBalance.toString(10) , values.carolBalance);
            });
        });
    });

    describe("withdraw...", function() {

        const withdrawValueSet = [
            {   sent:          "1024",
                aliceBalance:     "0",
                bobBalance:     "512",
                carolBalance:   "512",
                contractEther: "1024"
            },
            {   sent:             "3",
                aliceBalance:     "1",
                bobBalance:     "513",
                carolBalance:   "513",
                contractEther: "1027"
            },
        ];

        beforeEach("split first", function() {
            withdrawValueSet.forEach(values => {
                return splitterContract.split(
                    bob, carol,
                    {
                        from: alice,
                        value: values.sent
                    });
            });
        });

        it('should withdraw balance', async function() {
            const lastIndex = withdrawValueSet.length - 1;
            const previousCarolEther = await web3.eth.getBalancePromise(carol);
            const txObj = await splitterContract.withdraw({from: carol});
            assert.strictEqual(txObj.receipt.logs.length, 1);
            assert.strictEqual(txObj.logs.length, 1);
            assert.strictEqual(txObj.logs[0].event, 'LogWithdraw');
            assert.strictEqual(txObj.logs[0].args.sender, carol);
            assert.strictEqual(txObj.logs[0].args.toWithdraw.toString(10), withdrawValueSet[lastIndex].carolBalance);
            const gasUsed = txObj.receipt.gasUsed;
            const tx = await web3.eth.getTransactionPromise(txObj.tx);
            const gasPrice = tx.gasPrice;
            const gasCost = gasPrice.mul(gasUsed);

            const calculateCarolEther = previousCarolEther.minus(gasCost).plus(withdrawValueSet[lastIndex].carolBalance).toString(10);
            const currentCarolEther = await web3.eth.getBalancePromise(carol);
            assert.strictEqual(currentCarolEther.toString(10), calculateCarolEther);

            const calculateContractEther = new BigNumber(withdrawValueSet[lastIndex].contractEther).minus(new BigNumber(withdrawValueSet[lastIndex].carolBalance));
            const currentContractEther = await web3.eth.getBalancePromise(splitterContract.address);
            assert.strictEqual(currentContractEther.toString(10), calculateContractEther.toString(10));
        });
    });
});