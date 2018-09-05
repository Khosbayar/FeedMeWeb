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
    var supName = $('#supName').val();
    var supZipCode = $('#supArea').val();
    var supAccepted = $("#supAccepted").val();
    var supRestricted = $("#supRestricted").val();
    // var supStatusYes = $("#supStatAvailable").val();
    var supStatus = $("input[name=supStatus]:checked").val();
    console.log(supName,supZipCode,supAccepted,supRestricted,supStatus);
    App.contracts.FeedMe.deployed().then(function(instance) {
      return instance.UpdateSupplier(supName, supZipCode, supAccepted, supRestricted,supStatus, { from: App.account });
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
    var supName = $("#supName");
    var supArea = $("#supArea");
    var supAccepted = $("#supAccepted");
    var supRestricted = $("#supRestricted");
    var supStatusYes = $("#supStatAvailable");
    var supStatusNo = $("#supStatNotAvailable");

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
      return feedmeInstance.suppliers(App.account);
    }).then(function(supplier) {
      if(supplier[1]!=""){
        var name = supplier[1];
        var zipCode = String(supplier[2]);
        var accepted = supplier[3];
        var restricted = supplier[4];
        var status = supplier[5];
        console.log(name,zipCode,accepted,restricted,status);
        content.show();
        supName.val(name);
        supArea.val(zipCode);
        supAccepted.val(accepted);
        supRestricted.val(restricted);
        if(status==true){
          supStatusYes.prop("checked", true);
        }else{
          supStatusNo.prop("checked", true);
        }
      }else{
        content.html("<div class='panel panel-info'><h4 class='headingWhite'>Please, register as a supplier first! <br/> <a href='register.html'>Continue</a></h4></div>");        
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