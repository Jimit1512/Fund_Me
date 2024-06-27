const { deployments, ethers, network } = require("hardhat");
const { assert } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name) 
    ? describe.skip 
    : describe("FundMe", async () => {
    let fundMe;
    let deployer;
    const sendValue = ethers.parseEther("1");
    
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, deployer);
    });

    it(("allows people to fund and withdraw"), async () => {
        await fundMe.fund({ value: sendValue});
        await fundMe.withDraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.target);
        assert.equal(endingBalance.toString(), "0");
    });
});