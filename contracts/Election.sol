pragma solidity ^0.4.24;

contract Election {
    // Read/write candidate
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;
    mapping(address => bool) public voters;


    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;
    }


    // Constructor
    function Election () public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate (string _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }
}