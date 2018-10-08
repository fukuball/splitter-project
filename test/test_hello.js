var HelloWorld = artifacts.require('HelloWorld');

const PHRASE = "Hello World";

contract('HelloWorld', function(accounts) {

    var contract;

    beforeEach(function() {
      return HelloWorld.new().then(function(instance) {
        contract = instance;
      });
    });

    it('should say hello', async function() {
        let sayHello = await contract.sayHello.call();
        assert.equal(sayHello, PHRASE);
    });
});