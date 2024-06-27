//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error NotOwner();


//TYPE DECLARATIONS
contract FundMe {
    using PriceConverter for uint256;
    uint256 public constant MINIMUM_MONEY_USD = 50 * 1e18;//constant does not take storage and now it cant be get change

    //STATE VARIABLES
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner{
       // require(msg.sender == owner, "Sender is not the owner");
        if(msg.sender != i_owner){revert NotOwner();}
        _;
    }


    //CONSTRUCTOR
    //RECEIVE
    //FALLBACK
    //external
    //public
    //internal
    //private
    //view / pure
    constructor( address priceFeedAddress ){
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }
    
    //IF SOMEONE SEND FUND BY MISTAKE OTHER THEN CALLING fund FUNCTION  
    receive() external payable{
        fund();
    }
    fallback() external payable {
        fund();
    }
    
    function fund() public payable  {
        require(msg.value.getConversationRate(s_priceFeed) >= MINIMUM_MONEY_USD,"Didn't Send enough Ether");//returns in 18 decimals
        s_addressToAmountFunded[msg.sender] = msg.value;
        s_funders.push(msg.sender);
    }

    function withDraw() public onlyOwner{
        for(uint256 i=0; i < s_funders.length; i++){
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);//reset the array

        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function getOwner() public view returns(address){
        return i_owner;
    }

    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }
}