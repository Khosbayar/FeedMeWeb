var Election = artifacts.require("./Election.sol");
var FeedMe = artifacts.require("./FeedMe.sol");



module.exports = function(deployer) {
  deployer.deploy(Election);
  deployer.deploy(FeedMe);
};