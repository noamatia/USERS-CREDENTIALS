import fs from "fs";
import { ethers } from "hardhat";
import { ErrorDecoder } from "ethers-decode-error";
import type { DecodedError } from "ethers-decode-error";
import { CredentialManager } from "../../typechain-types";

const deployeAddressesJson =
  "ignition/deployments/chain-31337/deployed_addresses.json";
let credentialManager: CredentialManager | undefined;
const errorDecoder = ErrorDecoder.create();

/**
 * Error class for the CredentialManager service.
 */
export class CredentialManagerServiceError extends Error {
  constructor(message: string | null) {
    super(message ?? "An error occurred in the CredentialManager service.");
  }
}

/**
 * Interface representing a credential type.
 */
export interface CredentialType {
  id: number;
  name: string;
}

/**
 * Gets an instance of the CredentialManager contract.
 * If the instance is not already initialized, it reads the deployed address
 * from a JSON file and initializes the contract.
 * @returns {Promise<CredentialManager>} The CredentialManager contract instance.
 */
async function getCredentialManagerInstance(): Promise<CredentialManager> {
  if (!credentialManager) {
    const deployedAddress: string = JSON.parse(
      fs.readFileSync(deployeAddressesJson, "utf8")
    )["CredentialManagerModule#CredentialManager"];

    credentialManager = await ethers.getContractAt(
      "CredentialManager",
      deployedAddress
    );
  }
  return credentialManager;
}

/**
 * Creates a new credential type in the CredentialManager contract.
 * @param {string} credentialTypeName - The name of the credential type to create.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<void>} Resolves when the transaction is successful.
 */
export async function createCredentialType(
  credentialTypeName: string
): Promise<void> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      await credentialManager.createCredentialType(credentialTypeName);
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}

/**
 * Gets the number of credential types in the CredentialManager contract.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<number>} The number of credential types.
 */
export async function getNumberOfCredentialTypes(): Promise<number> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      const numberOfCredentialTypesBigInt: BigInt =
        await credentialManager.getNumberOfCredentialTypes();
      return Number(numberOfCredentialTypesBigInt);
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}

/**
 * Retrieves all credential types from the CredentialManager contract.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<CredentialType[]>} A list of all credential types.
 */
export async function getCredentialTypes(): Promise<CredentialType[]> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      const CredentialTypeStructOutputs: [BigInt, string][] =
        await credentialManager.getCredentialTypes();
      return CredentialTypeStructOutputs.map(
        ([id, name]: [BigInt, string]) => ({
          id: Number(id),
          name: name,
        })
      );
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}

/**
 * Retrieves the credential types assigned to a specific user from the CredentialManager contract.
 * @param {string} userAddress - The address of the user.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<CredentialType[]>}A list of all credential types assigned to the user.
 */
export async function getUserCredentialsTypes(
  userAddress: string
): Promise<CredentialType[]> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      const CredentialTypeStructOutputs: [BigInt, string][] =
        await credentialManager.getUserCredentialsTypes(userAddress);
      return CredentialTypeStructOutputs.map(
        ([id, name]: [BigInt, string]) => ({
          id: Number(id),
          name: name,
        })
      );
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}

/**
 * Verifies a user's credential by using a Merkle proof.
 * @param {string} userAddress - The address of the user.
 * @param {number} credentialTypeId - The ID of the credential type to verify.
 * @param {string[]} merkleProof - The Merkle proof for verification.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<boolean>} True if the credential is verified, false otherwise.
 */
export async function verifyCredential(
  userAddress: string,
  credentialTypeId: number,
  merkleProof: string[]
): Promise<boolean> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      return await credentialManager.verifyCredential(
        userAddress,
        credentialTypeId.toString(),
        merkleProof
      );
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}

/**
 * Assigns a credential type to a user in the CredentialManager contract.
 * @param {string} userAddress - The address of the user.
 * @param {number} credentialTypeId - The ID of the credential type to assign.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<void>} Resolves when the credential is successfully assigned.
 */
export async function assignCredential(
  userAddress: string,
  credentialTypeId: string
): Promise<void> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      await credentialManager.assignCredential(userAddress, credentialTypeId);
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}

/**
 * Sets the Merkle root for a credential type in the CredentialManager contract.
 * @param {string} merkleRoot - The Merkle root to set for the credential type.
 * @throws {CredentialManagerServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 * @returns {Promise<void>} Resolves when the Merkle root is successfully set.
 */
export async function setMerkleRoot(merkleRoot: string): Promise<void> {
  try {
    const credentialManager = await getCredentialManagerInstance();
    try {
      await credentialManager.setMerkleRoot(merkleRoot);
    } catch (error) {
      const decodedError: DecodedError = await errorDecoder.decode(error);
      throw new CredentialManagerServiceError(decodedError.reason);
    }
  } catch (error) {
    if (error instanceof CredentialManagerServiceError) {
      throw error;
    }
    throw new CredentialManagerServiceError("Failed to initialize contract.");
  }
}
