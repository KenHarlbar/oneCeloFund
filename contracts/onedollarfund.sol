// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Marketplace {

    uint internal donationsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Donation {
        address payable owner;
        string name;
        string image;
        string description;
        string location;
        uint budget;
        uint amount;
        uint totalAmountGotSoFar;
    }

    mapping (uint => Donation) internal donations;

    function writeDonation(
        string memory _name,
        string memory _image,
        string memory _description, 
        string memory _location, 
        uint _budget,
        uint _amount
    ) public {
        uint _totalAmountGotSoFar = 0;
        donations[donationsLength] = Donation(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _location,
            _budget,
            _amount,
            _totalAmountGotSoFar
        );
        donationsLength++;
    }

    function readDonation(uint _index) public view returns (
        address payable,
        string memory, 
        string memory, 
        string memory, 
        string memory,
        uint, 
        uint,
        uint
    ) {
        return (
            donations[_index].owner,
            donations[_index].name, 
            donations[_index].image, 
            donations[_index].description, 
            donations[_index].location, 
            donations[_index].budget,
            donations[_index].amount,
            donations[_index].totalAmountGotSoFar
        );
    }

    function donate(uint _index) public payable  {
        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            donations[_index].owner,
            donations[_index].amount
          ),
          "Transfer failed."
        );
        donations[_index].totalAmountGotSoFar += donations[_index].amount;
    }

    function getDonationsLength() public view returns (uint) {
        return (donationsLength);
    }
}
