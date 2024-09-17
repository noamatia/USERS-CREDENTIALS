import hre from "hardhat";
import { expect } from "chai";
import { CredentialTypeFactory } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CredentialTypeFactory", function () {
  /**
   * Deploys the CredentialTypeFactory contract.
   * @returns The contract instance, max name length, and credential type names.
   */
  async function deployCredentialTypeFactoryFixture() {
    const maxNameLength = 100;
    const credentialTypeNames: string[] = [
      "NBA Player",
      "NFL Player",
      "MLB Player",
    ];
    const CredentialTypeFactory = await hre.ethers.getContractFactory(
      "CredentialTypeFactory"
    );
    const credentialTypeFactory = await CredentialTypeFactory.deploy(
      maxNameLength
    );
    return { credentialTypeFactory, maxNameLength, credentialTypeNames };
  }

  /**
   * Helper function to create multiple credential types.
   * @param credentialTypeFactory - The deployed contract instance.
   * @param credentialTypeNames - An array of credential type names to create.
   */
  async function createCredentialTypes(
    credentialTypeFactory: CredentialTypeFactory,
    credentialTypeNames: string[]
  ) {
    for (const credentialTypeName of credentialTypeNames) {
      await credentialTypeFactory.createCredentialType(credentialTypeName);
    }
  }

  describe("Deployment", function () {
    it("Should set the right maxNameLength", async function () {
      const { credentialTypeFactory, maxNameLength } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      expect(await credentialTypeFactory.getMaxNameLength()).to.equal(
        maxNameLength
      );
    });

    it("Should revert with the right error if maxNameLength is 0", async function () {
      const CredentialTypeFactory = await hre.ethers.getContractFactory(
        "CredentialTypeFactory"
      );
      await expect(CredentialTypeFactory.deploy(0)).to.be.revertedWith(
        "Max name length must be greater than zero"
      );
    });
  });

  describe("Credential Type Creation", function () {
    it("Should return 0 if no credential types have been added", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      expect(await credentialTypeFactory.getNumberOfCredentialTypes()).to.equal(
        0
      );
    });

    it("Should return 1 if one credential type has been added", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await credentialTypeFactory.createCredentialType(credentialTypeNames[0]);
      expect(await credentialTypeFactory.getNumberOfCredentialTypes()).to.equal(
        1
      );
    });

    it("Should return n if n credential types have been added", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory, credentialTypeNames);
      expect(await credentialTypeFactory.getNumberOfCredentialTypes()).to.equal(
        credentialTypeNames.length
      );
    });

    it("Should return an empty array if no credential types have been added", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      expect(await credentialTypeFactory.getCredentialTypes()).to.have.lengthOf(
        0
      );
    });

    it("Should return an array with one element if one credential type has been added", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await credentialTypeFactory.createCredentialType(credentialTypeNames[0]);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      expect(credentialTypes).to.have.lengthOf(1);
    });

    it("Should return an array with n elements if n credential types have been added", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory, credentialTypeNames);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      expect(credentialTypes).to.have.lengthOf(credentialTypeNames.length);
    });

    it("Should add 1 valid credential type", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await credentialTypeFactory.createCredentialType(credentialTypeNames[0]);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      expect(credentialTypes[0].id).to.equal(0);
      expect(credentialTypes[0].name).to.equal(credentialTypeNames[0]);
    });

    it("Should add n valid credential types", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory, credentialTypeNames);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      for (let i = 0; i < credentialTypeNames.length; i++) {
        expect(credentialTypes[i].id).to.equal(i);
        expect(credentialTypes[i].name).to.equal(credentialTypeNames[i]);
      }
    });

    it("Should emit the right event", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await expect(
        credentialTypeFactory.createCredentialType(credentialTypeNames[0])
      )
        .to.emit(credentialTypeFactory, "CredentialTypeCreated")
        .withArgs(0, credentialTypeNames[0]);
    });
  });

  describe("Credential Type Validations", function () {
    it("Should revert with the right error if the name is empty", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await expect(
        credentialTypeFactory.createCredentialType("")
      ).to.be.revertedWith("Credential name cannot be empty");
    });

    it("Should revert with the right error if the name is too long", async function () {
      const { credentialTypeFactory, maxNameLength } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const longName = "a".repeat(maxNameLength + 1);
      await expect(
        credentialTypeFactory.createCredentialType(longName)
      ).to.be.revertedWith("Credential name exceeds character limit");
    });

    it("Should revert with the right error if the name contains non ASCII characters", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await expect(
        credentialTypeFactory.createCredentialType("🚀")
      ).to.be.revertedWith("Credential name must be ASCII");
    });

    it("Should revert with the right error if the name is already in use", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await credentialTypeFactory.createCredentialType(credentialTypeNames[0]);
      await expect(
        credentialTypeFactory.createCredentialType(credentialTypeNames[0])
      ).to.be.revertedWith("Credential name must be unique");
    });
  });

  describe("Checking Credential Type Existence", function () {
    it("Should return true if the credential type exists", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await credentialTypeFactory.createCredentialType(credentialTypeNames[0]);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      expect(
        await credentialTypeFactory.isCredentialType(credentialTypes[0].id)
      ).to.be.true;
    });

    it("Should return false if the credential type does not exist", async function () {
      const { credentialTypeFactory, credentialTypeNames } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory, credentialTypeNames);
      expect(
        await credentialTypeFactory.isCredentialType(credentialTypeNames.length)
      ).to.be.false;
    });
  });
});
