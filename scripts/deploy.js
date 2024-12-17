const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const metadata = JSON.parse(fs.readFileSync("./metadata/2.json", "utf8"));
    const name = metadata.name;
    const symbol = "JOJO";
    const baseTokenURI = "https://gateway.pinata.cloud/ipfs/bafybeif4jmuspqyqzejlufzr3bvter5k5hhe6qlxolnm7v4ylhzpcqat5m/"; 
    const Token = await ethers.getContractFactory("ERC721Token");
    const token = await Token.deploy(name, symbol, baseTokenURI);
    console.log("Token deployed to:", await token.getAddress());
    console.log("Metadata being used:", metadata);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
