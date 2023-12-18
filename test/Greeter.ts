import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  async function deploy() {
    const encodedHelloWorlMessage = await ethers.encodeBytes32String('Hello World');
    const greeter = await ethers.deployContract('Greeter', [encodedHelloWorlMessage]);
    return { greeter };
  }

  it("Should deploy to correct address", async function() {
    const { greeter } = await loadFixture(deploy);

    expect((await greeter.getAddress()).toLowerCase()).to.equal('0x5fbdb2315678afecb367f032d93f642f64180aa3');
  });

  it("Should set Hello World as message on creation", async function() {
    const { greeter } = await loadFixture(deploy);

    const encoded = await greeter.message();

    expect((await ethers.decodeBytes32String(encoded))).to.equal('Hello World');
  });

  it("Should allow change of message if you are the owner", async function() {
    const { greeter } = await loadFixture(deploy);

    const encodedHelloWorlAgainMessage = await ethers.encodeBytes32String('Hello World Again');
    await greeter.setMessage(encodedHelloWorlAgainMessage);
    const encoded = await greeter.message();

    expect((await ethers.decodeBytes32String(encoded))).to.equal('Hello World Again');
  });

  it("Should allow change of owner and setting of new message", async function() {
    const { greeter } = await loadFixture(deploy);

    const encodedNewMessage = await ethers.encodeBytes32String('This is getting ridiculous');
    const [owner, otherAccount] = await ethers.getSigners();
    const updatedGreeter = await greeter.connect(otherAccount);
    await updatedGreeter.claim();
    await updatedGreeter.setMessage(encodedNewMessage);
    const encoded = await updatedGreeter.message();

    expect((await ethers.decodeBytes32String(encoded))).to.equal('This is getting ridiculous');
  });

  it("Should not allow more owners claiming than 5", async function() {
    const { greeter } = await loadFixture(deploy);

    const encodedNewMessageA = await ethers.encodeBytes32String('This is getting ridiculous');
    const encodedNewMessageB = await ethers.encodeBytes32String('Or maybe not');
    const [owner, otherA, otherB, otherC, otherD, otherE] = await ethers.getSigners();

    const updatedGreeterA = await greeter.connect(otherA);
    await updatedGreeterA.claim();
    await updatedGreeterA.setMessage(encodedNewMessageA);

    const updatedGreeterB = await updatedGreeterA.connect(otherB);
    await updatedGreeterB.claim();
    await updatedGreeterB.setMessage(encodedNewMessageB);

    const updatedGreeterC = await updatedGreeterB.connect(otherC);
    await updatedGreeterC.claim();
    await updatedGreeterC.setMessage(encodedNewMessageA);

    const updatedGreeterD = await updatedGreeterC.connect(otherD);
    await updatedGreeterD.claim();
    await updatedGreeterD.setMessage(encodedNewMessageB);

    const updatedGreeterE = await updatedGreeterC.connect(otherE);

    await expect(updatedGreeterE.claim()).to.be.revertedWith('Max owners reached');
  });

  it("Should not allow more updates than 10", async function() {
    const { greeter } = await loadFixture(deploy);

    const encodedNewMessageA = await ethers.encodeBytes32String('I can do this all day');
    const encodedNewMessageB = await ethers.encodeBytes32String('Scratch that');
    const encodedNewMessageC = await ethers.encodeBytes32String('Nooo!!');

    await greeter.setMessage(encodedNewMessageA);
    await greeter.setMessage(encodedNewMessageB);
    await greeter.setMessage(encodedNewMessageA);
    await greeter.setMessage(encodedNewMessageB);
    await greeter.setMessage(encodedNewMessageC);
    await greeter.setMessage(encodedNewMessageB);
    await greeter.setMessage(encodedNewMessageA);
    await greeter.setMessage(encodedNewMessageC);
    await greeter.setMessage(encodedNewMessageA);
    await greeter.setMessage(encodedNewMessageB);

    await expect(greeter.setMessage(encodedNewMessageC)).to.be.revertedWith('Max update count reached');
  });

  it("Should not allow change of message to the same current message", async function() {
    const { greeter } = await loadFixture(deploy);

    const encodedMessage = await ethers.encodeBytes32String('Only one time');
    await greeter.setMessage(encodedMessage);

    await expect(greeter.setMessage(encodedMessage)).to.be.revertedWith("The message can't be the same");
  });

  it("The last updated message should be Goodbye", async function() {
    const { greeter } = await loadFixture(deploy);

    const encodedMessageA = await ethers.encodeBytes32String('I can do this all day');
    const encodedMessageB = await ethers.encodeBytes32String('Scratch that');
    const encodedMessageC = await ethers.encodeBytes32String('Nooo!!');
    const encodedMessageLast = await ethers.encodeBytes32String('Goodbye');

    await greeter.setMessage(encodedMessageA);
    await greeter.setMessage(encodedMessageB);
    await greeter.setMessage(encodedMessageA);
    await greeter.setMessage(encodedMessageB);
    await greeter.setMessage(encodedMessageC);
    await greeter.setMessage(encodedMessageB);
    await greeter.setMessage(encodedMessageA);
    await greeter.setMessage(encodedMessageC);
    await greeter.setMessage(encodedMessageB);
    await greeter.setMessage(encodedMessageLast);

    const message = await greeter.message();

    expect((await ethers.decodeBytes32String(message))).to.be.equal('Goodbye');
  });
});
