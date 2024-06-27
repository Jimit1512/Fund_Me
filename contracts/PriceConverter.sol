//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


library PriceConverter{
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256){
        // Address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        // ABI
        (, int256 answer,,,)=priceFeed.latestRoundData();//returns in 8 decimals
        return uint256(answer * 1e10);
    }

    function getConversationRate(uint256 _ethAmount, AggregatorV3Interface _priceFeed) internal view  returns(uint256){
        uint256 ethPrice = getPrice(_priceFeed);
        uint256 ethAmountUSD = (ethPrice * _ethAmount) / 1e18;
        return ethAmountUSD;
    }
}