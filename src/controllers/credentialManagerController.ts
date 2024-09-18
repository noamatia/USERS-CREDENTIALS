import { CredentialType } from "../models/credentialType";
import { getCredentialManagerInstance } from "../services/contractService";
import {
  getProof,
  getMerkleRoot,
  updateMerkleTree,
} from "../helpers/merkleTree";

// Get the number of credential types
/**
 * Fetches the total number of credential types.
 * @returns {Promise<number>} The number of credential types.
 */
export async function getNumberOfCredentialTypes(): Promise<number> {
  const credentialManager = await getCredentialManagerInstance();
  const numberOfCredentialTypes =
    await credentialManager.getNumberOfCredentialTypes();
  console.log("Fetched number of credential types:", numberOfCredentialTypes);
  return Number(numberOfCredentialTypes);
}

// Get all credential types
/**
 * Fetches all credential types from the contract.
 * @returns {Promise<CredentialType[]>} An array of CredentialType objects.
 */
export async function getCredentialTypes(): Promise<CredentialType[]> {
  const credentialManager = await getCredentialManagerInstance();
  const credentialTypes: CredentialType[] = (
    await credentialManager.getCredentialTypes()
  ).map(([id, name]: [BigInt, string]) => ({
    id: Number(id),
    name: name,
  }));
  console.log("Fetched credential types:", credentialTypes);
  return credentialTypes;
}

// Get credential types assigned to a specific user
/**
 * Fetches credential types assigned to a specific user.
 * @param {string} userAddress - The address of the user.
 * @returns {Promise<CredentialType[]>} An array of CredentialType objects.
 */
export async function getUserCredentialsTypes(
  userAddress: string
): Promise<CredentialType[]> {
  const credentialManager = await getCredentialManagerInstance();
  const userCredentialTypes: CredentialType[] = (
    await credentialManager.getUserCredentialsTypes(userAddress)
  ).map(([id, name]: [BigInt, string]) => ({
    id: Number(id),
    name: name,
  }));
  console.log(
    `Fetched credential types for user ${userAddress}:`,
    userCredentialTypes
  );
  return userCredentialTypes;
}

// Verify a credential against the stored Merkle proof
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
  const credentialManager = await getCredentialManagerInstance();
  const merkleProof = getProof(credentialTypeId);
  const isValid = await credentialManager.verifyCredential(
    userAddress,
    credentialTypeId.toString(),
    merkleProof
  );
  console.log(
    `Verified credential ${credentialTypeId} for user ${userAddress}:`,
    isValid
  );
  return isValid;
}

// Create a new credential type
/**
 * Creates a new credential type in the contract.
 * @param {string} credentialTypeName - The name of the credential type.
 * @returns {Promise<void>}
 */
export async function createCredentialType(
  credentialTypeName: string
): Promise<void> {
  const credentialManager = await getCredentialManagerInstance();
  await credentialManager.createCredentialType(credentialTypeName);
  console.log("Created new credential type:", credentialTypeName);
}

// Assign a credential type to a user
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
  const credentialManager = await getCredentialManagerInstance();
  await credentialManager.assignCredential(userAddress, credentialTypeId);
  updateMerkleTree(userAddress, parseInt(credentialTypeId));
  const merkleRoot = getMerkleRoot();
  await credentialManager.setMerkleRoot(merkleRoot);
  console.log(
    `Assigned credential ${credentialTypeId} to user ${userAddress} and updated Merkle root.`
  );
}
