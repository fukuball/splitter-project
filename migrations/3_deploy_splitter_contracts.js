var Ownerable = artifacts.require("Ownerable");
var Splitter = artifacts.require("Splitter");

module.exports = function(deployer) {
  deployer.deploy(Ownerable);
  deployer.link(Ownerable, Splitter);
  deployer.deploy(Splitter);
};