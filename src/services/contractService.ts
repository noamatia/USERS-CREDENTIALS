import fs from "fs";
import { ethers } from "hardhat";
import { CredentialManager } from "../../typechain-types";

const deployeAddressesJson =
  "ignition/deployments/chain-31337/deployed_addresses.json";

let credentialManager: CredentialManager;

/**
 * Initializes the credentialManager contract instance if not already initialized.
 * @returns The credentialManager contract instance.
 */
export async function getCredentialManagerInstance(): Promise<CredentialManager> {
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
