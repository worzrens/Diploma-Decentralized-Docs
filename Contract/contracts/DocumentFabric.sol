//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

contract DocumentFabric is ERC721URIStorage, Ownable {
    uint8 DocumentAmount;
    uint256 DocumentPrice = 1;

    struct buyer {
        uint256[] boughtDocument;
    }

    mapping(address => buyer) private buyers;
    mapping(uint256 => uint256) private arrayIndexes;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    constructor() ERC721("DocumentFabric", "ITM") {
        DocumentAmount = 10;
    }
    event DocumentPurchase(uint8 DocumentLeft);

    function changeDocumentPrice(uint256 amount) public onlyOwner {
        DocumentPrice = amount;
    }

    function send(uint256 id, address receiver) payable public returns (uint256[] memory response) {
        require(_tokenIds.current()>=id, "There is no such Document currently");
        address DocumentOwner = ownerOf(id);
        require(DocumentOwner==msg.sender, "You don't have such Document");
        safeTransferFrom(msg.sender, receiver, id);
        for (uint i = arrayIndexes[id]; i < buyers[DocumentOwner].boughtDocument.length - 1; i++) {
            if(i!=0){
                arrayIndexes[buyers[DocumentOwner].boughtDocument[i]] = i-1;
            }
            buyers[DocumentOwner].boughtDocument[i] = buyers[DocumentOwner].boughtDocument[i + 1];
        }
        buyers[receiver].boughtDocument.push(id);
        buyers[DocumentOwner].boughtDocument.pop();
        arrayIndexes[id] = buyers[DocumentOwner].boughtDocument.length-1;
        response = buyers[DocumentOwner].boughtDocument;

    }

    function getDocumentData() public view returns (uint256 price, uint8 amount){
        return (DocumentPrice, DocumentAmount);
    }

    function buy(address receiver, string memory DocumentJson)
    public
    payable
    returns (uint256 newItemId)
    {
        require(DocumentAmount > 0, "There are no more cars available");
        require(msg.value >= DocumentPrice, "There is not enough ETH for the purchase");
        _tokenIds.increment();
        newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        _setTokenURI(newItemId, DocumentJson);
        buyers[receiver].boughtDocument.push(newItemId);
        DocumentAmount -= 1;
        arrayIndexes[newItemId] = buyers[receiver].boughtDocument.length-1;
    }

    function getTokensByOwner(address senderAddress) public view returns (uint256[] memory tokens){
        tokens = buyers[senderAddress].boughtDocument;
    }

    function withdrawETH() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success,) = address(owner()).call{value : amount}("");
        require(success, "Transfer failed.");
    }
}
