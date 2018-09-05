pragma solidity ^0.4.24;

contract FeedMe {
    
    address public owner;
    bool public mutex;
    
    struct Supplier{
        uint id;
        string name;
        uint zipCode;
        string offering;
        string restriction;
        bool status;
    }
    
    struct User{
        string name;
        uint zipCode;
    }
    
    uint public totalUsers=0;
    // uint public totalLocalSupCount=0;
    uint public totalSuppliers=0;
    // Supplier[] public localSuppliers;

    mapping(address=>Supplier) public suppliers;
    mapping(address=>User) public users;
    
    address[] public supplierAddrs;
    address[] public userAddrs;
    
     
    constructor() public {
        owner = msg.sender;
    }
    
    modifier MUTEX {
		require(mutex == false);
		mutex = true;
		_;
		mutex = false;
	}
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    modifier hasNotRegistered{
        require(suppliers[msg.sender].zipCode==0,"Sorry, you have already registered");
        _;
    }
    
    modifier hasRegistered{
        require(suppliers[msg.sender].zipCode!=0,"Sorry, you are not registered yet");
        _;
    }
    
    modifier userHasNotRegistered{
        require(users[msg.sender].zipCode==0,"Sorry, you have already registered");
        _;
    }
    
    modifier userHasRegistered{
        require(users[msg.sender].zipCode!=0,"Sorry, you are not registered yet");
        _;
    }
    
    function RegisterFoodSupplier(string _name,uint _zipCode) public hasNotRegistered{
        // Use MUTEX to prevent race conditions when registeßring suppliers.
        // TODO: Add timeout to prevent bad actors succeeding in DOS.
        // TODO: Add method for preventing duplicate names by presenting similar listings.
        Supplier memory newSupplier;
        newSupplier.id = totalSuppliers;
        newSupplier.name = _name;
        newSupplier.zipCode = _zipCode;
        //newSupplier.offering = _offering;
        //newSupplier.restriction = _restriction;
        suppliers[msg.sender] = newSupplier;
        supplierAddrs.push(msg.sender);
        totalSuppliers++;
    }
    
    function RegisterUser(string _name,uint _zipCode) public userHasNotRegistered{
        User memory newUser;
        newUser.name= _name;
        newUser.zipCode = _zipCode;
        users[msg.sender] = newUser;
        userAddrs.push(msg.sender);
        totalUsers++;
    }
    
    modifier hasSupplier{
        require(supplierAddrs.length>0,"Sorry, No suppliers right now!");
        _;
    }
    
    function WhatAreSupplierOffering(address _foodSupplier) public view returns (string,string) {
        // For Adults, for children.
        // AKA getOfferings()
        // delegate
        require(suppliers[_foodSupplier].zipCode!=0,"Invalid supplier");
        return (suppliers[_foodSupplier].offering,suppliers[_foodSupplier].restriction);
    }
    
    function SetOfferings(string _JSONlist) public hasRegistered {
        suppliers[msg.sender].offering = _JSONlist;
    }
    
    function SetStatus(uint ind) public{
        suppliers[supplierAddrs[ind]].status = false;
    }
    
    function UpdateSupplier(string _name, uint _zipCode, string _accepted,string _restricted,bool _status) public hasRegistered{
        Supplier storage supplier = suppliers[msg.sender];
        supplier.name = _name;
        supplier.zipCode = _zipCode;
        supplier.offering = _accepted;
        supplier.restriction = _restricted;
        supplier.status = _status;
    }
    
    function UpdateUser(string _name, uint _zipCode) public hasRegistered{
        User storage user = users[msg.sender];
        user.name = _name;
        user.zipCode = _zipCode;
    }
    
    function withdraw() public onlyOwner {
        // Empty the Ethereum from this contract.
        owner.transfer(address(this).balance);
    }
}