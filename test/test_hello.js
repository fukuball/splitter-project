const HelloWorld = artifacts.require('HelloWorld');

contract('HelloWorld', function(accounts) {

    const PHRASE = "Hello World";
    const originalOwner = accounts[0];
    let helloWorldContract;

    beforeEach(function() {
      return HelloWorld.new({from: originalOwner}).then(function(instance) {
        helloWorldContract = instance;
      });
    });

    it('should say hello', async function() {
        const sayHello = await helloWorldContract.sayHello({from: originalOwner});
        assert.strictEqual(sayHello, PHRASE);
    });
});