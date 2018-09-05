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


      // App.contracts.FeedMe.defaults({
      //   gas: '200000'
      // })
      return App.renderFeedMe();
    });  
  },

  registerSupplier: function() {
    var supName = $('#supName').val();
    var supZipCode = $('#supZipCode').val();
    console.log(supName+" , "+supZipCode);
    App.contracts.FeedMe.deployed().then(function(instance) {
      return instance.RegisterFoodSupplier(supName, supZipCode, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },
  
  renderFeedMe: function() {
    var feedmeInstance;
    var loader = $("#loader");
    var content = $("#content_reg");
    var content_supplier = $("#content_supplier_reg");
    var supArea = $("#supAreaP");
    var supName = $("#supNameP");

    loader.show();
    content.hide();
    content_supplier.hide();
  
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
      // console.log("Name:"+supplier[0]);
      // console.log("Zip:"+supplier[1]);
      if(supplier[1]!=""){
        var name = supplier[1];
        var zipCode = supplier[2];
        content.hide();
        content_supplier.show();
        supName.append(name);
        supArea.append(String(zipCode));
      }else{
        content.show();
        content_supplier.hide();
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