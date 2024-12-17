const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x22D92Ab1Ea790C4DD64d0b1144B677464d9fBc3d";
    
    // Get signers
    const [owner] = await ethers.getSigners();
    const operatorAddress = "OPERATOR_ADDRESS";
    const approved = true;

    // Get contract instance
    const Token = await ethers.getContractFactory("ERC721Token");
    const token = Token.attach(contractAddress);

    console.log("Setting approval for all tokens to operator:", operatorAddress);

    // Set approval for all
    const tx = await token.setApprovalForAll(operatorAddress, approved);
    await tx.wait();

    console.log("Approval set successfully!");
    console.log("Transaction hash:", tx.hash);

    // Verify the approval
    const isApproved = await token.isApprovedForAll(owner.address, operatorAddress);
    console.log("Current approval status:", isApproved);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
