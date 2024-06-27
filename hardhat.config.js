require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("dotenv").config();


const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const COIMMASTER_API_KEY = process.env.COIMMASTER_API_KEY;
const ETHERSCAN_API_KEY=process.env.ETHER_API;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  etherscan:{
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {version: "0.8.8"},
      {version: "0.6.6"},
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia:{
      chainId: 11155111,
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      blockConfirmations: 6,
    }
  },
  gasReporter:{
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COIMMASTER_API_KEY,
    token: "ETH"
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  sourcify: {
    enabled: true
  },
  mocha: {
    timeout: 500000,
  },
};
