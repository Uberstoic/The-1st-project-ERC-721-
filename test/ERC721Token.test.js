    const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ERC721Token", function () {
    let Token;
    let token;
    let owner;
    let addr1;
    let addr2;
    const TOKEN_NAME = "TestToken";
    const TOKEN_SYMBOL = "TTK";
    const BASE_URI = "https://test.com/token/";

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Token = await ethers.getContractFactory("ERC721Token");
        token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, BASE_URI);
    });

    describe("Deployment", function () {
        it("Should set the correct token name and symbol", async function () {
            expect(await token.name()).to.equal(TOKEN_NAME);
            expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
        });

        it("Should set the correct owner", async function () {
            expect(await token.owner()).to.equal(owner.address);
        });

        it("Should support the correct interfaces", async function () {
            expect(await token.supportsInterface("0x80ac58cd")).to.be.true; // ERC721
            expect(await token.supportsInterface("0x5b5e139f")).to.be.true; // ERC721Metadata
            expect(await token.supportsInterface("0x01ffc9a7")).to.be.true; // ERC165
            expect(await token.supportsInterface("0x12345678")).to.be.false; // Random interface
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint a token", async function () {
            await token.mint(addr1.address, 1);
            expect(await token.ownerOf(1)).to.equal(addr1.address);
            expect(await token.balanceOf(addr1.address)).to.equal(1);
        });

        it("Should not allow non-owner to mint a token", async function () {
            await expect(
                token.connect(addr1).mint(addr2.address, 1)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not allow minting to zero address", async function () {
            await expect(
                token.mint(ethers.ZeroAddress, 1)
            ).to.be.revertedWith("ERC721: mint to the zero address");
        });

        it("Should not allow minting duplicate token ID", async function () {
            await token.mint(addr1.address, 1);
            await expect(
                token.mint(addr2.address, 1)
            ).to.be.revertedWith("ERC721: token already minted");
        });

        it("Should emit Transfer event on mint", async function () {
            await expect(token.mint(addr1.address, 1))
                .to.emit(token, "Transfer")
                .withArgs(ethers.ZeroAddress, addr1.address, 1);
        });
    });

    describe("Token transfers", function () {
        beforeEach(async function () {
            await token.mint(addr1.address, 1);
        });

        it("Should allow token owner to transfer", async function () {
            await token.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
            expect(await token.ownerOf(1)).to.equal(addr2.address);
        });

        it("Should not allow unauthorized transfer", async function () {
            await expect(
                token.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
            ).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });

        it("Should not allow transfer to zero address", async function () {
            await expect(
                token.connect(addr1).transferFrom(addr1.address, ethers.ZeroAddress, 1)
            ).to.be.revertedWith("ERC721: transfer to the zero address");
        });

        it("Should not allow transfer of nonexistent token", async function () {
            await expect(
                token.connect(addr1).transferFrom(addr1.address, addr2.address, 999)
            ).to.be.revertedWith("ERC721: owner query for nonexistent token");
        });

        it("Should clear approvals on transfer", async function () {
            await token.connect(addr1).approve(addr2.address, 1);
            await token.connect(addr1).transferFrom(addr1.address, owner.address, 1);
            expect(await token.getApproved(1)).to.equal(ethers.ZeroAddress);
        });
    });

    describe("Approvals", function () {
        beforeEach(async function () {
            await token.mint(addr1.address, 1);
        });

        it("Should allow token owner to approve others", async function () {
            await token.connect(addr1).approve(addr2.address, 1);
            expect(await token.getApproved(1)).to.equal(addr2.address);
        });

        it("Should not allow approving self", async function () {
            await expect(
                token.connect(addr1).approve(addr1.address, 1)
            ).to.be.revertedWith("ERC721: approval to current owner");
        });

        it("Should not allow unauthorized approval", async function () {
            await expect(
                token.connect(addr2).approve(addr2.address, 1)
            ).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
        });

        it("Should allow approved address to transfer", async function () {
            await token.connect(addr1).approve(addr2.address, 1);
            await token.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
            expect(await token.ownerOf(1)).to.equal(addr2.address);
        });

        it("Should allow setting approval for all", async function () {
            await token.connect(addr1).setApprovalForAll(addr2.address, true);
            expect(await token.isApprovedForAll(addr1.address, addr2.address)).to.be.true;
        });

        it("Should allow approved operator to transfer", async function () {
            await token.connect(addr1).setApprovalForAll(addr2.address, true);
            await token.connect(addr2).transferFrom(addr1.address, owner.address, 1);
            expect(await token.ownerOf(1)).to.equal(owner.address);
        });

        it("Should emit Approval event", async function () {
            await expect(token.connect(addr1).approve(addr2.address, 1))
                .to.emit(token, "Approval")
                .withArgs(addr1.address, addr2.address, 1);
        });

        it("Should emit ApprovalForAll event", async function () {
            await expect(token.connect(addr1).setApprovalForAll(addr2.address, true))
                .to.emit(token, "ApprovalForAll")
                .withArgs(addr1.address, addr2.address, true);
        });
    });

    describe("Token URI", function () {
        it("Should return correct token URI", async function () {
            await token.mint(addr1.address, 1);
            expect(await token.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
        });

        it("Should revert for nonexistent token", async function () {
            await expect(token.tokenURI(99))
                .to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
        });
    });

    describe("Balance and ownership queries", function () {
        it("Should revert when querying balance of zero address", async function () {
            await expect(token.balanceOf(ethers.ZeroAddress))
                .to.be.revertedWith("ERC721: balance query for the zero address");
        });

        it("Should revert when querying owner of nonexistent token", async function () {
            await expect(token.ownerOf(999))
                .to.be.revertedWith("ERC721: owner query for nonexistent token");
        });
    });

    describe("Safe transfers", function () {
        let receiverContract;
        let nonReceiverContract;
        let receiverThatRejects;

        beforeEach(async function () {
            await token.mint(addr1.address, 1);
            
            // Deploy receiver contracts
            const ReceiverMock = await ethers.getContractFactory("ERC721ReceiverMock");
            receiverContract = await ReceiverMock.deploy(true); // Will accept tokens
            receiverThatRejects = await ReceiverMock.deploy(false); // Will reject tokens
            
            const NonReceiverMock = await ethers.getContractFactory("NonERC721ReceiverMock");
            nonReceiverContract = await NonReceiverMock.deploy();
        });

        it("Should allow safe transfer to EOA", async function () {
            await token.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 1);
            expect(await token.ownerOf(1)).to.equal(addr2.address);
        });

        it("Should allow safe transfer with data to EOA", async function () {
            await token.connect(addr1)["safeTransferFrom(address,address,uint256,bytes)"](
                addr1.address,
                addr2.address,
                1,
                "0x"
            );
            expect(await token.ownerOf(1)).to.equal(addr2.address);
        });

        it("Should allow safe transfer to receiver contract", async function () {
            const receiverAddress = await receiverContract.getAddress();
            await token.connect(addr1).safeTransferFrom(addr1.address, receiverAddress, 1);
            expect(await token.ownerOf(1)).to.equal(receiverAddress);
        });

        it("Should allow safe transfer with data to receiver contract", async function () {
            const receiverAddress = await receiverContract.getAddress();
            await token.connect(addr1)["safeTransferFrom(address,address,uint256,bytes)"](
                addr1.address,
                receiverAddress,
                1,
                "0x42"
            );
            expect(await token.ownerOf(1)).to.equal(receiverAddress);
        });

        it("Should not allow safe transfer to non-receiver contract", async function () {
            const nonReceiverAddress = await nonReceiverContract.getAddress();
            await expect(
                token.connect(addr1).safeTransferFrom(addr1.address, nonReceiverAddress, 1)
            ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
        });

        it("Should not allow safe transfer to receiver contract that rejects tokens", async function () {
            const rejecterAddress = await receiverThatRejects.getAddress();
            await expect(
                token.connect(addr1).safeTransferFrom(addr1.address, rejecterAddress, 1)
            ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
        });

        it("Should not allow safe transfer with data to non-receiver contract", async function () {
            const nonReceiverAddress = await nonReceiverContract.getAddress();
            await expect(
                token.connect(addr1)["safeTransferFrom(address,address,uint256,bytes)"](
                    addr1.address,
                    nonReceiverAddress,
                    1,
                    "0x42"
                )
            ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
        });
    });
});
