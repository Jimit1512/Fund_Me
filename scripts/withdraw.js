async function main(){
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    const fundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, deployer);
    console.log("Funding....");
    const transactionResponse = await fundMe.withDraw();
    await transactionResponse.wait(1);
    console.log("Got it");
}


main().then(() => process.exit(0)).catch((error) =>{
    console.error(error);
    process.exit(1);
});