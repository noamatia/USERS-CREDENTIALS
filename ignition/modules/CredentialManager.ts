import CredentialTypeFactoryModule from "./CredentialTypeFactory";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CredentialManagerModule = buildModule("CredentialManagerModule", (m) => {
  const credentialTypeFactory = m.useModule(CredentialTypeFactoryModule);
  const credentialManager = m.contract("CredentialManager", [
    credentialTypeFactory.credentialTypeFactory,
  ]);
  return { credentialManager };
});

export default CredentialManagerModule;
