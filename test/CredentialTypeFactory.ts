import hre from "hardhat";
import { expect } from "chai";
import { CredentialTypeFactory } from "../typechain-types";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CredentialTypeFactory", function () {
  // Maximum length for credential type names
  const MAX_NAME_LENGTH = 100;
  // Define some sample credential type names
  const CREDENTIAL_TYPE_NAMES = ["NBA Player", "NFL Player", "MLB Player"];

  /**
   * Deploys the CredentialTypeFactory contract.
   * @returns The contract instance, max name length, and credential type names.
   */
  async function deployCredentialTypeFactoryFixture() {
    // Deploy CredentialTypeFactory contract with the specified max name length
    const CredentialTypeFactory = await hre.ethers.getContractFactory(
      "CredentialTypeFactory"
    );
    const credentialTypeFactory = await CredentialTypeFactory.deploy(
      MAX_NAME_LENGTH
    );

    return { credentialTypeFactory };
  }

  /**
   * Helper function to create multiple credential types.
   * @param credentialTypeFactory - The deployed contract instance.
   */
  async function createCredentialTypes(
    credentialTypeFactory: CredentialTypeFactory
  ) {
    for (const credentialTypeName of CREDENTIAL_TYPE_NAMES) {
      await credentialTypeFactory.createCredentialType(credentialTypeName);
    }
  }

  describe("Deployment", function () {
    it("Should set the right maxNameLength", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      expect(await credentialTypeFactory.getMaxNameLength()).to.equal(
        MAX_NAME_LENGTH
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
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialTypeFactory.createCredentialType(credentialTypeName);
      expect(await credentialTypeFactory.getNumberOfCredentialTypes()).to.equal(
        1
      );
    });

    it("Should return n if n credential types have been added", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory);
      expect(await credentialTypeFactory.getNumberOfCredentialTypes()).to.equal(
        CREDENTIAL_TYPE_NAMES.length
      );
    });

    it("Should return an empty array if no credential types have been added", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      expect(await credentialTypeFactory.getCredentialTypes()).to.be.empty;
    });

    it("Should return an array with one element if one credential type has been added", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialTypeFactory.createCredentialType(credentialTypeName);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      expect(credentialTypes).to.have.lengthOf(1);
    });

    it("Should return an array with n elements if n credential types have been added", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory);
      const credentialTypes = await credentialTypeFactory.getCredentialTypes();
      expect(credentialTypes).to.have.lengthOf(CREDENTIAL_TYPE_NAMES.length);
    });

    it("Should add 1 valid credential type", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialTypeFactory.createCredentialType(credentialTypeName);
      const credentialType = await credentialTypeFactory.getCredentialType(
        credentialTypeId
      );
      expect(credentialType.id).to.equal(credentialTypeId);
      expect(credentialType.name).to.equal(credentialTypeName);
    });

    it("Should add n valid credential types", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory);
      for (let i = 0; i < CREDENTIAL_TYPE_NAMES.length; i++) {
        const credentialTypeId = i;
        const credentialTypeName = CREDENTIAL_TYPE_NAMES[i];
        const credentialType = await credentialTypeFactory.getCredentialType(
          credentialTypeId
        );
        expect(credentialType.id).to.equal(credentialTypeId);
        expect(credentialType.name).to.equal(credentialTypeName);
      }
    });

    it("Should emit the right event", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await expect(
        credentialTypeFactory.createCredentialType(credentialTypeName)
      )
        .to.emit(credentialTypeFactory, "CredentialTypeCreated")
        .withArgs(credentialTypeId, credentialTypeName, anyValue);
    });
  });

  describe("Credential Type Validations", function () {
    it("Should revert with the right error if the name is empty", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await expect(
        credentialTypeFactory.createCredentialType("")
      ).to.be.revertedWith("Name exceeds character limit");
    });

    it("Should revert with the right error if the name is too long", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const longName = "a".repeat(MAX_NAME_LENGTH + 1);
      await expect(
        credentialTypeFactory.createCredentialType(longName)
      ).to.be.revertedWith("Name exceeds character limit");
    });

    it("Should revert with the right error if the name contains non ASCII characters", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await expect(
        credentialTypeFactory.createCredentialType("🚀")
      ).to.be.revertedWith("Name must be ASCII");
    });

    it("Should revert with the right error if the name is already in use", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialTypeFactory.createCredentialType(credentialTypeName);
      await expect(
        credentialTypeFactory.createCredentialType(credentialTypeName)
      ).to.be.revertedWith("Name must be unique");
    });

    it("Should revert with the right error if the credential type does not exist", async function () {
      const { credentialTypeFactory } = await loadFixture(
        deployCredentialTypeFactoryFixture
      );
      await createCredentialTypes(credentialTypeFactory);
      await expect(
        credentialTypeFactory.getCredentialType(CREDENTIAL_TYPE_NAMES.length)
      ).to.be.revertedWith("Invalid credential type ID");
    });
  });
});
