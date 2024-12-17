const { ethers } = require("hardhat");

async function main() {
    // Get the contract address from the deployment
    const contractAddress = "0x22D92Ab1Ea790C4DD64d0b1144B677464d9fBc3d"; // Replace with your deployed contract address
    
    // Get signers
    const [sender] = await ethers.getSigners();
    const receiverAddress = "RECEIVER_ADDRESS"; // Replace with the receiver's address
    const tokenId = 1; // Replace with the token ID you want to transfer

    // Get contract instance
    const Token = await ethers.getContractFactory("ERC721Token");
    const token = Token.attach(contractAddress);

    console.log("Transferring token", tokenId, "from", sender.address, "to", receiverAddress);

    // Transfer the token
    const tx = await token.transferFrom(sender.address, receiverAddress, tokenId);
    await tx.wait();

    console.log("Token transferred successfully!");
    console.log("Transaction hash:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
