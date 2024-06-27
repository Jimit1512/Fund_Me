const { deployments, ethers } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) 
    ? describe.skip 
    : describe("FundMe", function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    const sendValue = ethers.parseEther("1");

    beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        
        await deployments.fixture(["all"]); // Will run through deploy script and deploy the contracts
        const fundMeDeployment = await deployments.get("FundMe");
        const mockV3AggregatorDeployment = await deployments.get("MockV3Aggregator");
        
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, deployer);
        mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", mockV3AggregatorDeployment.address);
    });

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, mockV3Aggregator.target);
        });
    });

    describe("fund", function(){
        it("Fails if not send enough ETH", async function(){
            await expect(fundMe.fund()).to.be.revertedWith("Didn't Send enough Ether");
        });
        
        it("Updated the amount funded data structure", async function() {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds getFunder to the array of getFunder", async () => {
            await fundMe.fund({value: sendValue});
            const funder = await fundMe.getFunder(0);
            assert.equal(funder, deployer.address);
        });
    });

    describe("withDraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({value: sendValue});
        });

        it("Withdraw ETH from a single founder", async () => {
            // Arrange
            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target);
            const startingDeployerBalance = await ethers.provider.getBalance(deployer);

            // Act
            const transactionResponse = await fundMe.withDraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed, gasPrice} = transactionReceipt;
            const gasCost = BigInt(gasUsed.toString())*BigInt(gasPrice.toString());

            const endingFundMeBalance = BigInt(await ethers.provider.getBalance(fundMe.target));
            const endingDeployerBalance = BigInt(await ethers.provider.getBalance(deployer));

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0");
            assert.equal(
                (startingFundMeBalance+startingDeployerBalance).toString(),
                (endingDeployerBalance+gasCost).toString()
            );
        });
        
        it("Allow us to withdraw multiple getFunder", async () => {
            //Arrange
            const accounts = await ethers.getSigners();
            for(let i=1; i<6 ; i++){
                const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                await fundMeConnectedContract.fund({value : sendValue});
            }

            const startingFundMeBalance = await ethers.provider.getBalance(fundMe.target);
            const startingDeployerBalance = await ethers.provider.getBalance(deployer);

            //Act
            const transactionResponse = await fundMe.withDraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed, gasPrice} = transactionReceipt;
            const gasCost = BigInt(gasUsed.toString())*BigInt(gasPrice.toString());


            const endingFundMeBalance = BigInt(await ethers.provider.getBalance(fundMe.target));
            const endingDeployerBalance = BigInt(await ethers.provider.getBalance(deployer));

            //Assert
            assert.equal(endingFundMeBalance.toString(), "0");
            assert.equal(
                (startingFundMeBalance+startingDeployerBalance).toString(),
                (endingDeployerBalance+gasCost).toString()
            );
            //
            await expect(fundMe.getFunder(0)).to.be.reverted;
            
            for(let i=1; i<6; i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
            }
        });

        it("Only allows the owner to withdraw the amount", async () => {
            const accounts = await ethers.getSigners();
            const fundMeConnectedContract = await fundMe.connect(accounts[1]);
            await expect(fundMeConnectedContract.withDraw()).to.be.revertedWithCustomError(fundMe,"NotOwner");
        });
    });
});
