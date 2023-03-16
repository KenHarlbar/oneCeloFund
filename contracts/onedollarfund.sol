// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract onedollarfund {

    uint256 internal donationsLength = 0;

    address internal adminAddress;


    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;


    //donation details struct
    struct Donation {
        address payable owner;
        string name;
        string image;
        string description;
        string location;
        uint256 budget;
        uint256 totalAmountGotSoFar;
    }

    constructor(){
        adminAddress = msg.sender;
    }

    //onlyAdmin modifier
    modifier onlyAdmin(){
        require(adminAddress == msg.sender," You are not the admin");
        _;
    }


    //mapping for the donations
    mapping(uint256 => Donation) internal donations;


    //register and store a donation campaign
    function writeDonation(
        string calldata _name,
        string calldata _image,
        string calldata _description,
        string calldata _location,
        uint256 _budget
    ) public {

        uint256 _totalAmountGotSoFar = 0;
        donations[donationsLength] = Donation(
            payable(msg.sender),
            _name,
            _image,
            _description,
            _location,
            _budget,
            _totalAmountGotSoFar
        );
        donationsLength++;
    }


    //get details about a specific donation
    function readDonation(uint256 _index)
        public
        view
        returns (
            Donation memory
        )
    {
        return (
            donations[_index]
            
        );
    }


    //contribute to a donation campaign
    function donate(uint256 _index) public payable {
        Donation memory _donation = donations[_index];
        require(_donation.totalAmountGotSoFar < _donation.budget,"Campaign budget has been reached");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                _donation.owner,
                1
            ),
            "Transfer failed."
        );
        _donation.totalAmountGotSoFar += 1;
    }


    //get the number of all donaton campaigns
    function getDonationsLength() public view returns (uint256) {
        return (donationsLength);
    }


    //admin delete campaigns that seem fraudlent
    function deleteCampaign(uint _index) public onlyAdmin{
        delete donations[_index];
    }

    
}
