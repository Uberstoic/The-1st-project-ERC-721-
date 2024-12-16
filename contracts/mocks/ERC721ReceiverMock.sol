// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../ERC721Token.sol";

contract ERC721ReceiverMock {
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
    
    bool private _retval;
    
    constructor(bool retval) {
        _retval = retval;
    }
    
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4) {
        return _retval ? _ERC721_RECEIVED : bytes4(0);
    }
}
