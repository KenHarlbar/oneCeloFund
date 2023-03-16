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
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Donation {
        address payable owner;
        string name;
        string image;
        string description;
        string location;
        uint256 budget;
        uint256 totalAmountGotSoFar;
    }

    mapping(uint256 => Donation) internal donations;

    function writeDonation(
        string memory _name,
        string memory _image,
        string memory _description,
        string memory _location,
        uint256 _budget
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty.");
        require(bytes(_image).length > 0, "Image URL cannot be empty.");
        require(bytes(_description).length > 0, "Description cannot be empty.");
        require(bytes(_location).length > 0, "Location cannot be empty.");
        require(_budget > 0, "Budget must be greater than zero.");
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

    function readDonation(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            donations[_index].owner,
            donations[_index].name,
            donations[_index].image,
            donations[_index].description,
            donations[_index].location,
            donations[_index].budget,
            donations[_index].totalAmountGotSoFar
        );
    }


function donate(uint256 _index, uint256 _amount) public {
    require(_index < donationsLength, "Invalid index.");
    require(_amount > 0, "Donation amount must be greater than zero.");
    require(
        IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _amount
        ),
        "Transfer failed."
    );
    donations[_index].totalAmountGotSoFar += _amount;
    require(
        IERC20Token(cUsdTokenAddress).transfer(
            donations[_index].owner,
            _amount
        ),
        "Transfer failed."
    );
}


    function getDonationsLength() public view returns (uint256) {
        return (donationsLength);
    }
}
