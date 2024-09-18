import * as ethersService from "../services/ethersService";

/**
 * Retrieves the address of the owner of the contract.
 * @returns {Promise<string>} The address of the contract owner.
 */
export async function getOwnerAddress(): Promise<string> {
  const ownerAddress = await ethersService.getOwnerAddress();
  console.log("Fetched owner address:", ownerAddress);
  return ownerAddress;
}

/**
 * Retrieves the addresses of all users in the contract.
 * @returns {Promise<string[]>} An array of user addresses.
 */
export async function getUsersAddresses(): Promise<string[]> {
  const usersAddresses = await ethersService.getUsersAddresses();
  console.log("Fetched users addresses:", usersAddresses);
  return usersAddresses;
}

/**
 * Retrieves the balance of a user.
 * @param {string} userAddress - The address of the user.
 * @returns {Promise<number>} The balance of the user in Ether.
 */
export async function getUserBalance(userAddress: string): Promise<number> {
  const balance = await ethersService.getUserBalance(userAddress);
  console.log(`Fetched balance for user ${userAddress}:`, balance);
  return balance;
}
