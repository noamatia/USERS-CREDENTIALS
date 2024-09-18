import hre from "hardhat";
import { expect } from "chai";
import { CredentialManager } from "../typechain-types";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("CredentialManager", function () {
  // Maximum length for credential type names
  const MAX_NAME_LENGTH = 100;
  // Define some sample credential type names
  const CREDENTIAL_TYPE_NAMES = ["NBA Player", "NFL Player", "MLB Player"];

  /**
   * Deploys the credentialManager contract.
   * @param singleUser - Whether to deploy the contract with a single user.
   * @param setMerkleRootByNonOwner - Whether to set the Merkle root by a non-owner.
   * @returns The contract instance, credentialTypeFactory address, Merkle tree, owner, and users.
   */
  async function deployCredentialManagerFixture(
    singleUser = false,
    setMerkleRoot = true
  ) {
    // Get signers for owner and test users
    const [owner, user1, user2, user3] = await hre.ethers.getSigners();
    const users = singleUser ? [user1] : [user1, user2, user3];

    // Values for the Merkle tree
    const values = singleUser
      ? CREDENTIAL_TYPE_NAMES.map((_, i) => [users[0].address, i.toString()])
      : CREDENTIAL_TYPE_NAMES.map((_, i) => [users[i].address, i.toString()]);
    const merkleTree = StandardMerkleTree.of(values, ["address", "uint256"]);
    const merkleRoot = merkleTree.root;

    // Deploy CredentialTypeFactory contract with the specified max name length
    const CredentialTypeFactory = await hre.ethers.getContractFactory(
      "CredentialTypeFactory"
    );
    const credentialTypeFactory = await CredentialTypeFactory.deploy(
      MAX_NAME_LENGTH
    );
    await credentialTypeFactory.waitForDeployment();

    // Get the deployed factory's address
    const credentialTypeFactoryAddress =
      await credentialTypeFactory.getAddress();

    // Deploy CredentialManager contract using the factory's address
    const CredentialManager = await hre.ethers.getContractFactory(
      "CredentialManager"
    );
    const credentialManager = await CredentialManager.deploy(
      credentialTypeFactoryAddress
    );
    await credentialManager.waitForDeployment();
    if (setMerkleRoot) {
      await credentialManager.setMerkleRoot(merkleRoot);
    }

    return {
      credentialManager,
      credentialTypeFactoryAddress,
      merkleTree,
      owner,
      users,
    };
  }

  /**
   * Deploys the credentialManager contract with a single user.
   * @returns The contract instance, credentialTypeFactory address, Merkle tree, owner, and user.
   */
  async function deployCredentialManagerFixtureSingleUser() {
    return await deployCredentialManagerFixture(true);
  }

  /**
   * Deploys the credentialManager contract without a Merkle root.
   * @returns The contract instance, credentialTypeFactory address, Merkle tree, owner, and users.
   */
  async function deployCredentialManagerFixtureNoMerkleRoot() {
    return await deployCredentialManagerFixture(false, false);
  }

  /**
   * Helper function to create multiple credential types.
   * @param credentialManager - The deployed contract instance.
   * @param CREDENTIAL_TYPE_NAMES - An array of credential type names to create.
   */
  async function createCredentialTypes(credentialManager: CredentialManager) {
    for (const credentialTypeName of CREDENTIAL_TYPE_NAMES) {
      await credentialManager.createCredentialType(credentialTypeName);
    }
  }

  describe("Deployment", function () {
    it("Should set the right credentialTypeFactory", async function () {
      const { credentialManager, credentialTypeFactoryAddress } =
        await loadFixture(deployCredentialManagerFixture);
      expect(
        await credentialManager.getCredentialTypeFactoryAddress()
      ).to.equal(credentialTypeFactoryAddress);
    });
  });

  describe("Merkle Root Setting", function () {
    it("Shoule revert if setting the Merkle root by a non-owner", async function () {
      const { credentialManager, merkleTree, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      await expect(
        credentialManager.connect(users[0]).setMerkleRoot(merkleTree.root)
      ).to.be.revertedWithCustomError(
        credentialManager,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should emit the MerkleRootUpdated event", async function () {
      const { credentialManager, merkleTree } = await loadFixture(
        deployCredentialManagerFixture
      );
      await expect(credentialManager.setMerkleRoot(merkleTree.root))
        .to.emit(credentialManager, "MerkleRootUpdated")
        .withArgs(merkleTree.root);
    });
  });

  describe("Credential Type Creation", function () {
    it("Should return 0 if no credential types have been added", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      expect(await credentialManager.getNumberOfCredentialTypes()).to.equal(0);
    });

    it("Should return 1 if one credential type has been added", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await credentialManager.createCredentialType(CREDENTIAL_TYPE_NAMES[0]);
      expect(await credentialManager.getNumberOfCredentialTypes()).to.equal(1);
    });

    it("Should return n if n credential types have been added", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await createCredentialTypes(credentialManager);
      expect(await credentialManager.getNumberOfCredentialTypes()).to.equal(
        CREDENTIAL_TYPE_NAMES.length
      );
    });

    it("Should return an empty array if no credential types have been added", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      expect(await credentialManager.getCredentialTypes()).to.be.empty;
    });

    it("Should return an array with one element if one credential type has been added", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await credentialManager.createCredentialType(CREDENTIAL_TYPE_NAMES[0]);
      const credentialTypes = await credentialManager.getCredentialTypes();
      expect(credentialTypes).to.have.lengthOf(1);
    });

    it("Should return an array with n elements if n credential types have been added", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await createCredentialTypes(credentialManager);
      const credentialTypes = await credentialManager.getCredentialTypes();
      expect(credentialTypes).to.have.lengthOf(CREDENTIAL_TYPE_NAMES.length);
    });

    it("Should add 1 valid credential type", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      const credentialTypeId = 0;
      const credentialTypeName = CREDENTIAL_TYPE_NAMES[credentialTypeId];
      await credentialManager.createCredentialType(credentialTypeName);
      const credentialTypes = await credentialManager.getCredentialTypes();
      expect(credentialTypes[0].id).to.equal(credentialTypeId);
      expect(credentialTypes[0].name).to.equal(credentialTypeName);
    });

    it("Should add n valid credential types", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await createCredentialTypes(credentialManager);
      const credentialTypes = await credentialManager.getCredentialTypes();
      for (const [i, credentialType] of credentialTypes.entries()) {
        const credentialTypeId = i;
        const credentialTypeName = CREDENTIAL_TYPE_NAMES[i];
        expect(credentialType.id).to.equal(credentialTypeId);
        expect(credentialType.name).to.equal(credentialTypeName);
      }
    });
  });

  describe("Credential Type Validations", function () {
    it("Should revert with the right error if the name is empty", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await expect(
        credentialManager.createCredentialType("")
      ).to.be.revertedWith("Name exceeds character limit");
    });

    it("Should revert with the right error if the name is too long", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      const longName = "a".repeat(MAX_NAME_LENGTH + 1);
      await expect(
        credentialManager.createCredentialType(longName)
      ).to.be.revertedWith("Name exceeds character limit");
    });

    it("Should revert with the right error if the name contains non ASCII characters", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      await expect(
        credentialManager.createCredentialType("🚀")
      ).to.be.revertedWith("Name must be ASCII");
    });

    it("Should revert with the right error if the name is already in use", async function () {
      const { credentialManager } = await loadFixture(
        deployCredentialManagerFixture
      );
      const credentialTypeName = CREDENTIAL_TYPE_NAMES[0];
      await credentialManager.createCredentialType(credentialTypeName);
      await expect(
        credentialManager.createCredentialType(credentialTypeName)
      ).to.be.revertedWith("Name must be unique");
    });

    it("Should revert if a non-owner tries to create a credential type", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await expect(
        credentialManager.connect(user).createCredentialType(credentialTypeName)
      ).to.be.revertedWithCustomError(
        credentialManager,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Credential Type Assignment", function () {
    it("Should return an empty array if no credentials have been assigned", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      expect(await credentialManager.getUserCredentialsTypes(users[0].address))
        .to.be.empty;
    });

    it("Should return an array with 1 element if 1 credential has been assigned", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialManager.createCredentialType(credentialTypeName);
      await credentialManager.assignCredential(user.address, credentialTypeId);
      const userCredentialsTypes =
        await credentialManager.getUserCredentialsTypes(user.address);
      expect(userCredentialsTypes).to.have.lengthOf(1);
    });

    it("Should return an array with n elements if n credentials have been assigned", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      await createCredentialTypes(credentialManager);
      for (let i = 0; i < CREDENTIAL_TYPE_NAMES.length; i++) {
        const credentialTypeId = i;
        await credentialManager.assignCredential(
          user.address,
          credentialTypeId
        );
      }
      const userCredentialsTypes =
        await credentialManager.getUserCredentialsTypes(user.address);
      expect(userCredentialsTypes).to.have.lengthOf(
        CREDENTIAL_TYPE_NAMES.length
      );
    });

    it("Should assign 1 valid user credential", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialManager.createCredentialType(credentialTypeName);
      await credentialManager.assignCredential(user.address, credentialTypeId);
      const userCredentialsTypes =
        await credentialManager.getUserCredentialsTypes(user.address);
      expect(userCredentialsTypes[0].id).to.equal(credentialTypeId);
      expect(userCredentialsTypes[0].name).to.equal(credentialTypeName);
    });

    it("Should assign n valid user credentials", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const values = users.map((user, i) => [user.address, i.toString()]);
      await createCredentialTypes(credentialManager);
      for (const value of values) {
        await credentialManager.assignCredential(value[0], value[1]);
      }
      const userCredentialsTypes =
        await credentialManager.getUserCredentialsTypes(users[0].address);
      for (const [i, userCredential] of userCredentialsTypes.entries()) {
        expect(userCredential.id).to.equal(i);
        expect(userCredential.name).to.equal(CREDENTIAL_TYPE_NAMES[i]);
      }
    });
  });

  describe("Credential Type Assignment Validation", function () {
    it("Should revert with the right error if the user has already been assigned the credential", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialManager.createCredentialType(credentialTypeName);
      await credentialManager.assignCredential(user.address, credentialTypeId);
      await expect(
        credentialManager.assignCredential(user.address, credentialTypeId)
      ).to.be.revertedWith("Credential already assigned");
    });

    it("Should revert with the right error if the credential type does not exist", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const createCredentialTypeId = 0;
      await expect(
        credentialManager.assignCredential(user.address, createCredentialTypeId)
      ).to.be.revertedWith("Invalid credential type ID");
    });

    it("Should revert if a non-owner tries to assign a credential", async function () {
      const { credentialManager, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      await credentialManager.createCredentialType(credentialTypeName);
      await expect(
        credentialManager
          .connect(user)
          .assignCredential(user.address, credentialTypeId)
      ).to.be.revertedWithCustomError(
        credentialManager,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Verify Credential", function () {
    it("Should return false if the user has not been assigned the credential", async function () {
      const { credentialManager, merkleTree, users } = await loadFixture(
        deployCredentialManagerFixture
      );
      const [user] = users;
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      const proof = merkleTree.getProof(credentialTypeId);
      await credentialManager.createCredentialType(credentialTypeName);
      const isValid = await credentialManager.verifyCredential(
        user.address,
        credentialTypeId.toString(),
        proof
      );
      expect(isValid).to.be.false;
    });

    it("Should return true if a single user has been assigned the credentials", async function () {
      const { credentialManager, users, merkleTree } = await loadFixture(
        deployCredentialManagerFixtureSingleUser
      );
      const [user] = users;
      for (let i = 0; i < CREDENTIAL_TYPE_NAMES.length; i++) {
        const credentialTypeId = i;
        const credentialTypeName = CREDENTIAL_TYPE_NAMES[i];
        await credentialManager.createCredentialType(credentialTypeName);
        await credentialManager.assignCredential(
          user.address,
          credentialTypeId
        );
      }
      for (let i = 0; i < CREDENTIAL_TYPE_NAMES.length; i++) {
        const credentialTypeId = i;
        const proof = merkleTree.getProof(credentialTypeId);
        const isValid = await credentialManager.verifyCredential(
          user.address,
          credentialTypeId.toString(),
          proof
        );
        expect(isValid).to.be.true;
      }
    });

    it("Should return true if users have been assigned the credentials", async function () {
      const { credentialManager, users, merkleTree } = await loadFixture(
        deployCredentialManagerFixture
      );
      for (let i = 0; i < CREDENTIAL_TYPE_NAMES.length; i++) {
        const credentialTypeId = i;
        const credentialTypeName = CREDENTIAL_TYPE_NAMES[i];
        await credentialManager.createCredentialType(credentialTypeName);
        await credentialManager.assignCredential(
          users[i].address,
          credentialTypeId
        );
      }
      for (let i = 0; i < CREDENTIAL_TYPE_NAMES.length; i++) {
        const credentialTypeId = i;
        const proof = merkleTree.getProof(credentialTypeId);
        const isValid = await credentialManager.verifyCredential(
          users[i].address,
          credentialTypeId.toString(),
          proof
        );
        expect(isValid).to.be.true;
      }
    });

    it("Should return false if the merkle root has not been set", async function () {
      const { credentialManager, users, merkleTree } = await loadFixture(
        deployCredentialManagerFixtureNoMerkleRoot
      );
      const [user] = users;
      const credentialTypeId = 0;
      const [credentialTypeName] = CREDENTIAL_TYPE_NAMES;
      const proof = merkleTree.getProof(credentialTypeId);
      await credentialManager.createCredentialType(credentialTypeName);
      await credentialManager.assignCredential(user.address, credentialTypeId);
      const isValid = await credentialManager.verifyCredential(
        user.address,
        credentialTypeId.toString(),
        proof
      );
      expect(isValid).to.be.false;
    });
  });
});
