const HelloWorld = artifacts.require('HelloWorld');

contract('HelloWorld', function(accounts) {

    const PHRASE = "Hello World";
    const originalOwner = accounts[0];
    var contract;

    beforeEach(function() {
      return HelloWorld.new({from: originalOwner}).then(function(instance) {
        contract = instance;
      });
    });

    it('should say hello', async function() {
        const sayHello = await contract.sayHello({from: originalOwner});
        assert.equal(sayHello, PHRASE);
    });
});