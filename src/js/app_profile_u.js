App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("FeedMe.json", function(feedme) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.FeedMe = TruffleContract(feedme);
      // Connect provider to interact with contract
      App.contracts.FeedMe.setProvider(App.web3Provider);


      App.contracts.FeedMe.defaults({
        gas: '200000'
      })
      return App.renderFeedMe();
    });  
  },

  updateProfile: function() {
    var userName = $('#userName').val();
    var userZipCode = $('#userArea').val();

    console.log(userName, userZipCode);
    
    App.contracts.FeedMe.deployed().then(function(instance) {
      return instance.UpdateUser(String(userName), parseInt(userZipCode), { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      alert("Successfully updated!");
      $("#content").hide(); 
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
  
  renderFeedMe: function() {
    var feedmeInstance;
    var loader = $("#loader");
    var content = $("#content");
    var userName = $("#userName");
    var userArea = $("#userArea");

    loader.show();
    content.hide();
  
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.FeedMe.deployed().then(function(instance) {
      feedmeInstance = instance;
      return feedmeInstance.users(App.account);
    }).then(function(user) {
      if(user[0]!=""){
        var name = user[0];
        var zipCode = String(user[1]);
        content.show();
        userName.val(name);
        userArea.val(zipCode);
      }else{
        content.html("<div class='panel panel-info'><h4 class='headingWhite'>Please, register as as user first! <br/> <a href='register_u.html'>Continue</a></h4></div>");        
        content.show();
      }
      
    }).catch(function(error) {
      console.warn(error);
    });

    loader.hide();    
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});