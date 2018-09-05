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
        gas: '2000000'
      })
      return App.renderFeedMe();
    });
  },

  setStatus: function(id) {
    var str = "#supAddr"+id;
    var supAddr = $(String(str));
    var supAddrString = supAddr.val();
    console.log(parseInt(id));
    App.contracts.FeedMe.deployed().then(function(instance) {
      return instance.SetStatus(parseInt(id),{ from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      alert("Request sent!");
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
    var modalContent = $("#modalContent");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    var supplierCount=0;
    // Load contract data
    App.contracts.FeedMe.deployed().then(function(instance) {
      feedmeInstance = instance;
      return feedmeInstance.users(App.account);
    }).then(function(user) {
      if(user[0]!=""){
        var zipCode = user[1];
        var suppliersResults = $("#suppliersResult");
        suppliersResults.empty();
        // ListSuppliersInArea
        feedmeInstance.totalSuppliers().then(function(totalSuppliers){
          for(var i=0;i<totalSuppliers;i++){
            feedmeInstance.supplierAddrs(i).then(function(supplierAddr){
                feedmeInstance.suppliers(supplierAddr).then(function(supplier){
                  var id = String(supplier[0]);
                  var supName = supplier[1];
                  var supZipCode = String(supplier[2]);
                  var offerings = supplier[3];
                  var restriction = supplier[4];
                  var status = supplier[5];
                  if(supZipCode==zipCode){
                    console.log(id,supName,supZipCode,status);
                    supplierCount++;
                    var btnavailable = status==true ? "" : "disabled";
                    var availability = status==true ? "<ul class='list-group'><li class='list-group-item list-group-item-success'>Available</li></ul>" : "<ul class='list-group'><li class='list-group-item list-group-item-danger'>Not available</li></ul>";
                    var supTemplate = "<tr><td>" + supplierCount + "</td><td>" + supName + "</td><td>" + supZipCode + "</td><td>" + availability + "</td><td><button type='button' class='btn btn-success' " + btnavailable + " data-toggle='modal' data-target='#myModal"+ id +"'>Offer</button></td></tr>";
                    var supNewModal = "<input type='hidden' id='supAddr"+id+"' value='"+supplierAddr+"' /><div class='modal fade' id='myModal"+id+"' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'><div class='modal-dialog' role='document'><div class='modal-content'><div class='modal-header'><h5 class='modal-title' id='exampleModalLabel'>Offerings of "+ supName +"</h5><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div><div class='modal-body'><h4><strong>Accepted:</strong></h4><br/><textarea readonly class='form-control' rows='3'>"+ offerings +"</textarea><hr/><h4><strong>Restrictions:</strong></h4><br/><textarea readonly class='form-control' rows='3'>"+ restriction +"</textarea></div><div class='modal-footer'><button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button><button type='button' class='btn btn-primary' onClick='App.setStatus("+id+"); return false;'>Request it</button></div></div></div></div>";
                    suppliersResults.append(supTemplate);
                    modalContent.append(supNewModal);
                  }
                })
            })
          }
          
        }).catch(function(err){
        console.log(err);
      })
      }else{
        content.html("<h4 class='headingWhite'>Please, register as a user first! <br/> <a href='register_u.html'>Continue</a></h4>");
        content.show();
      }
    }).catch(function(error) {
      console.warn(error);
    });
    

    content.show();
    loader.hide();   
   
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});