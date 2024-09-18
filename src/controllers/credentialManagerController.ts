import { CredentialType } from "../services/credentialManagerService";
import * as credentialManagerService from "../services/credentialManagerService";
import {
  getProof,
  getMerkleRoot,
  updateMerkleTree,
} from "../helpers/merkleTree";

/**
 * Fetches the total number of credential types.
 * @returns {Promise<number>} The number of credential types.
 */
export async function getNumberOfCredentialTypes(): Promise<number> {
  const numberOfCredentialTypes = Number(
    await credentialManagerService.getNumberOfCredentialTypes()
  );
  console.log("Fetched number of credential types:", numberOfCredentialTypes);
  return numberOfCredentialTypes;
}

/**
 * Fetches all credential types from the contract.
 * @returns {Promise<CredentialType[]>} An array of CredentialType objects.
 */
export async function getCredentialTypes(): Promise<CredentialType[]> {
  const credentialTypes = await credentialManagerService.getCredentialTypes();
  console.log("Fetched credential types:", credentialTypes);
  return credentialTypes;
}

/**
 * Fetches credential types assigned to a specific user.
 * @param {string} userAddress - The address of the user.
 * @returns {Promise<CredentialType[]>} An array of CredentialType objects.
 */
export async function getUserCredentialsTypes(
  userAddress: string
): Promise<CredentialType[]> {
  const userCredentialTypes =
    await credentialManagerService.getUserCredentialsTypes(userAddress);
  console.log(
    `Fetched credential types for user ${userAddress}:`,
    userCredentialTypes
  );
  return userCredentialTypes;
}

/**
 * Verifies a credential using the Merkle proof stored.
 * @param {string} userAddress - The address of the user.
 * @param {number} credentialTypeId - The ID of the credential type.
 * @returns {Promise<boolean>} Whether the credential is valid or not.
 */
export async function verifyCredential(
  userAddress: string,
  credentialTypeId: number
): Promise<boolean> {
  const merkleProof = getProof(userAddress, credentialTypeId);
  if (!merkleProof) {
    console.log(
      "Merkle proof not found for credential type:",
      credentialTypeId
    );
    return false;
  }
  const isValid = await credentialManagerService.verifyCredential(
    userAddress,
    credentialTypeId,
    merkleProof
  );
  console.log(
    `Verified credential ${credentialTypeId} for user ${userAddress}:`,
    isValid
  );
  return isValid;
}

/**
 * Creates a new credential type in the contract.
 * @param {string} credentialTypeName - The name of the credential type.
 * @returns {Promise<void>}
 */
export async function createCredentialType(
  credentialTypeName: string
): Promise<void> {
  await credentialManagerService.createCredentialType(credentialTypeName);
  console.log("Created new credential type:", credentialTypeName);
}

/**
 * Assigns a credential type to a user.
 * @param {string} userAddress - The address of the user.
 * @param {string} credentialTypeId - The ID of the credential type.
 * @returns {Promise<void>}
 */
export async function assignCredential(
  userAddress: string,
  credentialTypeId: string
): Promise<void> {
  await credentialManagerService.assignCredential(
    userAddress,
    credentialTypeId
  );
  updateMerkleTree(userAddress, parseInt(credentialTypeId));
  const merkleRoot = getMerkleRoot();
  await credentialManagerService.setMerkleRoot(merkleRoot);
  console.log(
    `Assigned credential ${credentialTypeId} to user ${userAddress} and updated Merkle root.`
  );
}
