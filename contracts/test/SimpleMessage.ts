import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("SimpleMessage", function () {
  async function deploySimpleMessageFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const simpleMessage = await hre.viem.deployContract("SimpleMessage");

    const publicClient = await hre.viem.getPublicClient();

    return {
      simpleMessage,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with empty initial state", async function () {
      const { simpleMessage } = await loadFixture(deploySimpleMessageFixture);

      expect(await simpleMessage.read.lastMessage()).to.equal("");
      expect(await simpleMessage.read.lastSender()).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("Message Setting", function () {
    it("Should set message and update state", async function () {
      const { simpleMessage, owner } = await loadFixture(deploySimpleMessageFixture);

      const testMessage = "Hello, World!";
      await simpleMessage.write.setMessage([testMessage]);

      expect(await simpleMessage.read.lastMessage()).to.equal(testMessage);
      expect(await simpleMessage.read.lastSender()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should emit MessageReceived event", async function () {
      const { simpleMessage, owner, publicClient } = await loadFixture(
        deploySimpleMessageFixture
      );

      const testMessage = "Test event message";
      const hash = await simpleMessage.write.setMessage([testMessage]);
      await publicClient.waitForTransactionReceipt({ hash });

      const messageEvents = await simpleMessage.getEvents.MessageReceived();
      expect(messageEvents).to.have.lengthOf(1);
      expect(messageEvents[0].args.message).to.equal(testMessage);
      expect(messageEvents[0].args.sender).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should update message when called multiple times", async function () {
      const { simpleMessage, owner } = await loadFixture(deploySimpleMessageFixture);

      const firstMessage = "First message";
      const secondMessage = "Second message";

      await simpleMessage.write.setMessage([firstMessage]);
      expect(await simpleMessage.read.lastMessage()).to.equal(firstMessage);

      await simpleMessage.write.setMessage([secondMessage]);
      expect(await simpleMessage.read.lastMessage()).to.equal(secondMessage);
      expect(await simpleMessage.read.lastSender()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should track different senders", async function () {
      const { simpleMessage, owner, otherAccount } = await loadFixture(
        deploySimpleMessageFixture
      );

      const ownerMessage = "Message from owner";
      const otherMessage = "Message from other account";

      await simpleMessage.write.setMessage([ownerMessage]);
      expect(await simpleMessage.read.lastSender()).to.equal(
        getAddress(owner.account.address)
      );

      const simpleMessageAsOther = await hre.viem.getContractAt(
        "SimpleMessage",
        simpleMessage.address,
        { client: { wallet: otherAccount } }
      );

      await simpleMessageAsOther.write.setMessage([otherMessage]);
      expect(await simpleMessage.read.lastMessage()).to.equal(otherMessage);
      expect(await simpleMessage.read.lastSender()).to.equal(
        getAddress(otherAccount.account.address)
      );
    });
  });

  describe("Message Getting", function () {
    it("Should return message and sender via getMessage", async function () {
      const { simpleMessage, owner } = await loadFixture(deploySimpleMessageFixture);

      const testMessage = "Test getMessage function";
      await simpleMessage.write.setMessage([testMessage]);

      const [message, sender] = await simpleMessage.read.getMessage();
      expect(message).to.equal(testMessage);
      expect(sender).to.equal(getAddress(owner.account.address));
    });

    it("Should return empty values initially", async function () {
      const { simpleMessage } = await loadFixture(deploySimpleMessageFixture);

      const [message, sender] = await simpleMessage.read.getMessage();
      expect(message).to.equal("");
      expect(sender).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty string messages", async function () {
      const { simpleMessage, owner } = await loadFixture(deploySimpleMessageFixture);

      await simpleMessage.write.setMessage([""]);
      expect(await simpleMessage.read.lastMessage()).to.equal("");
      expect(await simpleMessage.read.lastSender()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should handle very long messages", async function () {
      const { simpleMessage } = await loadFixture(deploySimpleMessageFixture);

      const longMessage = "A".repeat(1000);
      await simpleMessage.write.setMessage([longMessage]);
      expect(await simpleMessage.read.lastMessage()).to.equal(longMessage);
    });
  });
});