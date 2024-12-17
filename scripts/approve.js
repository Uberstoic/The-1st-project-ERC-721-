const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x22D92Ab1Ea790C4DD64d0b1144B677464d9fBc3d";
    
    // Get signers
    const [owner] = await ethers.getSigners();
    const approvedAddress = "APPROVED_ADDRESS"; // Replace with the address to approve
    const tokenId = 1; // Replace with the token ID you want to approve

    // Get contract instance
    const Token = await ethers.getContractFactory("ERC721Token");
    const token = Token.attach(contractAddress);

    console.log("Approving address", approvedAddress, "for token", tokenId);

    // Approve the address
    const tx = await token.approve(approvedAddress, tokenId);
    await tx.wait();

    console.log("Address approved successfully!");
    console.log("Transaction hash:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
