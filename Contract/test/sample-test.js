const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const someAcc = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const receiver = '0x2546BcD3c84621e976D8185a91A922aE77ECEc30';
    const hammer = 'https://firstbohdan.s3.us-east-2.amazonaws.com/Hammer.json';
    const DocumentFabric = await hre.ethers.getContractFactory("DocumentFabric");
    const carFabric = await DocumentFabric.deploy();
    await carFabric.deployed();
    carFabric.on('DocumentPurchase',console.log(1))
    const statistic1 = await carFabric.getDocumentData();
    expect(statistic1[1]).to.be.eq(10);
    const buying = await carFabric.buy(someAcc, hammer, {value: 1111111});
    const txr = await buying.wait();
    const statistic2 = await carFabric.getDocumentData();
    expect(statistic2[1]).to.be.eq(9);
    // console.log('before await',owning);
    expect(txr.events[0].event).to.be.eq('Transfer');
    const URI = await carFabric.tokenURI(1);
    console.log('URI',URI);
    const itemOwner = await carFabric.ownerOf(1);
    console.log('itemOwner',itemOwner);
    let yourTokens = await carFabric.getTokensByOwner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log(yourTokens.toString())
    await carFabric.buy(someAcc, hammer, {value: 1111111});
    await carFabric.withdrawETH();
    await carFabric.buy(someAcc, hammer, {value: 1111111});
    await carFabric.buy(someAcc, hammer, {value: 1111111});
    await carFabric.buy(someAcc, hammer, {value: 1111111});
    yourTokens = await carFabric.getTokensByOwner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log(yourTokens.toString())

    await carFabric.send(5, receiver);
    yourTokens = await carFabric.getTokensByOwner(receiver);
    console.log('receiverTokens:', yourTokens.toString())
    yourTokens = await carFabric.getTokensByOwner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('yourTokens:', yourTokens.toString())

    await carFabric.send(1, receiver);
    yourTokens = await carFabric.getTokensByOwner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('yourTokens:', yourTokens.toString())
    await carFabric.send(4, receiver);
    yourTokens = await carFabric.getTokensByOwner('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.log('yourTokens:', yourTokens.toString())
    yourTokens = await carFabric.getTokensByOwner(receiver);
    console.log('receiverTokens:', yourTokens.toString())
    const recOwner = await carFabric.ownerOf(4);
    console.log('receiverAddress:', recOwner.toString())
    expect(txr.events[0].args[2]).to.be.eq('1');
    expect(txr.events[0].args[1]).to.be.eq(someAcc);
  });
});
