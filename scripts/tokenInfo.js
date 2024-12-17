const { ethers } = require("hardhat");

async function main() {
    // Get the contract address from the deployment
    const contractAddress = "0x22D92Ab1Ea790C4DD64d0b1144B677464d9fBc3d"; // Replace with your deployed contract address
    
    // Get contract instance
    const Token = await ethers.getContractFactory("ERC721Token");
    const token = Token.attach(contractAddress);

    // Get token information
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();

    console.log("Token Information:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", totalSupply.toString());

    // You can add more token information here as needed
    // For example, getting owner of a specific token:
    const tokenId = 1; // Replace with the token ID you want to check
    try {
        const owner = await token.ownerOf(tokenId);
        console.log(`Owner of token ${tokenId}:`, owner);
    } catch (error) {
        console.log(`Token ${tokenId} does not exist`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
