// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
//import "hardhat/console.sol";

// Deploy to Goerli at 0x74daC7dA583473150798167Bf1AbC387b6E9E9EA

contract BuyMeACoffee {

    //Event to emit when a Memo is create
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    //Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List of all memos received form friends.
    Memo [] memos;

    // Address of contract deployer Marked payable so that
    // we can withdraw to this address later.
    address payable owner;
    address payable withdrawAddress;

    constructor(){
        // Store the address of the deployer as a payable address.
        // When we withdraw funds, we'll withdraw here.
        owner = payable(msg.sender);
        withdrawAddress = payable(msg.sender);
    }

    function changeAddress(address payable _withdrawAddress) public payable {
        require(msg.sender == owner, "only the owner can change the address");
        withdrawAddress = _withdrawAddress;
    }

    /**
    * @dev buy a coffee for contract owner
    * @param _name name of the coffee buyer
    * @param _message a nice message from the coffee buyer
    */
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "can't by coffee with 0 eth");

        // Add the memo to storage
        memos.push(Memo(
                msg.sender,
                block.timestamp,
                _name,
                _message
            ));

        // Emit a log event whn a new memo is created !
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
    }

    /**
    * @dev Send the entire balance stored in this contract to the owner
    */
    function withdrawTips() public {
        require(withdrawAddress.send(address(this).balance));
    }



    /**
    * @dev Retrieve all the memos received and stored on the blockchain
    */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }

}
