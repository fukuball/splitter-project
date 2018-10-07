var HelloWorld = artifacts.require('HelloWorld');

const PHRASE = "Hello World";

contract('HelloWorld', function(accounts) {
    it('should say hello', function() {
        var contract;
        HelloWorld.deployed().then((instance) => {
            contract = instance;
            assert.equal(contract.sayHello.call(), PHRASE);
        });
    });
});