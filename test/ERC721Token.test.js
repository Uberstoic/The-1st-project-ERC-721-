    const { ethers } = require("hardhat");
    const { expect } = require("chai");

    describe("ERC721Token", function () {
        let Token, token, owner, addr1, addr2;

        beforeEach(async function () {
            [owner, addr1, addr2] = await ethers.getSigners();
            Token = await ethers.getContractFactory("ERC721Token");
            token = await Token.deploy();
            const tokenAddress = await token.getAddress();

        });

        it("Should mint a token and assign it to the correct owner", async function () {
            await token.mint(addr1.address, 1);
            expect(await token.ownerOf(1)).to.equal(addr1.address);
        });

        it("Should transfer a token", async function () {
            await token.mint(addr1.address, 1);
            await token.connect(addr1).transferFrom(addr1.address, owner.address, 1);
            expect(await token.ownerOf(1)).to.equal(owner.address);
        });

        it("Should not mint a token that already exists", async function () {
            await token.mint(addr1.address, 1);
            await expect(token.mint(addr1.address, 1)).to.be.revertedWith("ERC721: token already minted");
        });
        
        it("Should not burn a nonexistent token", async function () {
            await expect(token.burn(1)).to.be.revertedWith("ERC721: owner query for nonexistent token");
        });
        
        it("Should not transfer to zero address", async function () {
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr1).transferFrom(addr1.address, "0x0000000000000000000000000000000000000000", 1)
            ).to.be.revertedWith("ERC721: transfer to the zero address");
        });

        it("Should approve a token and allow transfer by approved address", async function () {
            await token.mint(addr1.address, 1);
            await token.connect(addr1).approve(addr2.address, 1);
        
            expect(await token.getApproved(1)).to.equal(addr2.address);
        
            await token.connect(addr2).transferFrom(addr1.address, addr2.address, 1);
            expect(await token.ownerOf(1)).to.equal(addr2.address);
        });
        
        it("Should allow setting and checking approval for all tokens", async function () {
            await token.setApprovalForAll(addr2.address, true);
            expect(await token.isApprovedForAll(owner.address, addr2.address)).to.be.true;
        
            await token.setApprovalForAll(addr2.address, false);
            expect(await token.isApprovedForAll(owner.address, addr2.address)).to.be.false;
        });

        it("Should emit Transfer event on mint", async function () {
            await expect(token.mint(addr1.address, 1))
            .to.emit(token, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", addr1.address, 1);

        });
        
        it("Should emit Approval event", async function () {
            await token.mint(addr1.address, 1);
            await expect(token.connect(addr1).approve(addr2.address, 1))
                .to.emit(token, "Approval")
                .withArgs(addr1.address, addr2.address, 1);
        });
        
        it("Should emit ApprovalForAll event", async function () {
            await expect(token.setApprovalForAll(addr2.address, true))
                .to.emit(token, "ApprovalForAll")
                .withArgs(owner.address, addr2.address, true);
        });
        
        it("Should revert when querying approval for nonexistent token", async function () {
            await expect(token.getApproved(999)).to.be.revertedWith("ERC721: approved query for nonexistent token");
        });
        
        it("Should revert when transferring from incorrect owner", async function () {
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr2).transferFrom(addr2.address, owner.address, 1)
            ).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });   
        
        it("Should return false for nonexistent token via getApproved", async function () {
            await expect(token.getApproved(999)).to.be.revertedWith("ERC721: approved query for nonexistent token");
        });        

        // it("Should transfer to a contract implementing IERC721Receiver", async function () {
        //     const Receiver = await ethers.getContractFactory("ERC721ReceiverMock");
        //     const receiver = await Receiver.deploy();
        //     const receiverAddress = await receiver.getAddress();
        
        //     await token.mint(addr1.address, 1);
        //     await token.connect(addr1).safeTransferFrom(addr1.address, receiverAddress, 1);
        
        //     expect(await token.ownerOf(1)).to.equal(receiverAddress);
        // });        
        
        it("Should revert when transferring to a contract not implementing IERC721Receiver", async function () {
            const NonReceiver = await ethers.getContractFactory("NonERC721ReceiverMock");
            const nonReceiver = await NonReceiver.deploy();
            const nonReceiverAddress = await nonReceiver.getAddress();
        
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr1).safeTransferFrom(addr1.address, nonReceiverAddress, 1)
            ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
        });        

        it("Should revert when transferring to zero address", async function () {
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr1).transferFrom(addr1.address, "0x0000000000000000000000000000000000000000", 1)
            ).to.be.revertedWith("ERC721: transfer to the zero address");
        });
        
        it("Should revert when approving token by non-owner", async function () {
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr2).approve(owner.address, 1)
            ).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
        });

        it("Should emit Transfer event on transfer", async function () {
            await token.mint(addr1.address, 1);
            await expect(token.connect(addr1).transferFrom(addr1.address, owner.address, 1))
                .to.emit(token, "Transfer")
                .withArgs(addr1.address, owner.address, 1);
        });
        
        it("Should emit Approval event", async function () {
            await token.mint(addr1.address, 1);
            await expect(token.connect(addr1).approve(addr2.address, 1))
                .to.emit(token, "Approval")
                .withArgs(addr1.address, addr2.address, 1);
        });   

        it("Should revert when querying balance of zero address", async function () {
            await expect(token.balanceOf("0x0000000000000000000000000000000000000000")).to.be.revertedWith("ERC721: balance query for the zero address");
        });        

        it("Should revert when querying owner of nonexistent token", async function () {
            await expect(token.ownerOf(999)).to.be.revertedWith("ERC721: owner query for nonexistent token");
        });

        it("Should return false for nonexistent token in _exists", async function () {
            await expect(token.getApproved(999)).to.be.revertedWith("ERC721: approved query for nonexistent token");
        });        

        it("Should revert when transferring to non ERC721Receiver implementer", async function () {
            const NonReceiver = await ethers.getContractFactory("NonERC721ReceiverMock");
            const nonReceiver = await NonReceiver.deploy();
            const nonReceiverAddress = await nonReceiver.getAddress();
        
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr1).safeTransferFrom(addr1.address, nonReceiverAddress, 1)
            ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
        });
        
        // it("Should transfer to ERC721Receiver implementer", async function () {
        //     const Receiver = await ethers.getContractFactory("ERC721ReceiverMock");
        //     const receiver = await Receiver.deploy();
        //     const receiverAddress = await receiver.getAddress();
        
        //     await token.mint(addr1.address, 1);
        //     await token.connect(addr1).safeTransferFrom(addr1.address, receiverAddress, 1);
        
        //     expect(await token.ownerOf(1)).to.equal(receiverAddress);
        // });
        
        it("Should revert when transferring from incorrect owner", async function () {
            await token.mint(addr1.address, 1);
            await expect(
                token.connect(addr2).transferFrom(addr1.address, owner.address, 1)
            ).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });

        it("Should set approval correctly", async function () {
            await token.mint(addr1.address, 1);
            await token.connect(addr1).approve(addr2.address, 1);
        
            expect(await token.getApproved(1)).to.equal(addr2.address);
        });
        
        it("Should revert when minting to the zero address", async function () {
            await expect(token.mint("0x0000000000000000000000000000000000000000", 1)).to.be.revertedWith("ERC721: mint to the zero address");
        });    
        
        it("Should revert when minting an existing token", async function () {
            await token.mint(addr1.address, 1);
            await expect(token.mint(addr1.address, 1)).to.be.revertedWith("ERC721: token already minted");
        });

        it("Should burn a token", async function () {
            await token.mint(addr1.address, 1);
            await token.connect(addr1).burn(1);
            await expect(token.ownerOf(1)).to.be.revertedWith("ERC721: owner query for nonexistent token");
        });

        it("Should revert when burning nonexistent token", async function () {
            await expect(token.burn(999)).to.be.revertedWith("ERC721: owner query for nonexistent token");
        });
        

        it("Should revert when approving the zero address", async function () {
            await token.mint(addr1.address, 1);
            await expect(token.connect(addr1).approve("0x0000000000000000000000000000000000000000", 1))
                .to.be.revertedWith("ERC721: approve to the zero address");
        });        

        it("Should revert when transferring nonexistent token", async function () {
            await expect(token.transferFrom(addr1.address, addr2.address, 999))
                .to.be.revertedWith("ERC721: owner query for nonexistent token");
        });        

        it("Should transfer to an EOA (non-contract address) without issues", async function () {
            await token.mint(addr1.address, 1);
            await token.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 1); // addr2 - EOA
            expect(await token.ownerOf(1)).to.equal(addr2.address);
        });
              
        // it("Should transfer to a contract implementing IERC721Receiver successfully", async function () {
        //     const Receiver = await ethers.getContractFactory("ERC721ReceiverMock");
        //     const receiver = await Receiver.deploy();
        //     await token.mint(addr1.address, 1);
        //     await token.connect(addr1).safeTransferFrom(addr1.address, receiver.address, 1);
        //     expect(await token.ownerOf(1)).to.equal(receiver.address);
        // });        

    });
