import { ethers } from "hardhat";
import { ErrorDecoder } from "ethers-decode-error";
import type { DecodedError } from "ethers-decode-error";

const errorDecoder = ErrorDecoder.create();

/**
 * Error class for the Ethers service.
 */
export class EthersServiceError extends Error {
  constructor(message: string | null) {
    super(message ?? "An error occurred in the CredentialManager service.");
  }
}

/**
 * Retrieves the address of the owner of the contract.
 * @returns {Promise<string>} The address of the contract owner.
 * @throws {EthersServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 */
export async function getOwnerAddress(): Promise<string> {
  try {
    const [owner] = await ethers.getSigners();
    return owner.address;
  } catch (error) {
    const decodedError: DecodedError = await errorDecoder.decode(error);
    throw new EthersServiceError(decodedError.reason);
  }
}

/**
 * Retrieves the addresses of all users in the contract.
 * @returns {Promise<string[]>} An array of user addresses.
 * @throws {EthersServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 */
export async function getUsersAddresses(): Promise<string[]> {
  try {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const accounts = await provider.listAccounts();
    return accounts.map((account) => account.address);
  } catch (error) {
    const decodedError: DecodedError = await errorDecoder.decode(error);
    throw new EthersServiceError(decodedError.reason);
  }
}

/**
 * Retrieves the balance of a user.
 * @param {string} userAddress - The address of the user.
 * @returns {Promise<number>} The balance of the user in Ether.
 * @throws {EthersServiceError} When the transaction reverts, an error is thrown with the decoded revert reason.
 */
export async function getUserBalance(userAddress: string): Promise<number> {
  try {
    const balanceWei = await ethers.provider.getBalance(userAddress);
    const balanceEth = ethers.formatEther(balanceWei);
    return Number(balanceEth);
  } catch (error) {
    const decodedError: DecodedError = await errorDecoder.decode(error);
    throw new EthersServiceError(decodedError.reason);
  }
}
