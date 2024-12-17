async function main() {
    const [deployer] = await ethers.getSigners();

    const contractAddress = "0xEB760A49b81b190f4Bd0a851d6Ee8B9628500cF3";
    const ERC721Token = await ethers.getContractFactory("ERC721Token");
    const contract = await ERC721Token.attach(contractAddress);

    const recipient = "0x22D92Ab1Ea790C4DD64d0b1144B677464d9fBc3d";
    const tokenId = 2;

    console.log(`Minting token ${tokenId} to ${recipient}...`);
    const tx = await contract.mint(recipient, tokenId);
    await tx.wait();

    console.log(`Token ${tokenId} minted successfully to ${recipient}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
