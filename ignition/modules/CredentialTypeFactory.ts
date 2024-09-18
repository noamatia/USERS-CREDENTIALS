import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MAX_NAME_LENGTH = 100;

const CredentialTypeFactoryModule = buildModule(
  "CredentialTypeFactory",
  (m) => {
    const maxNameLength = m.getParameter("maxNameLength", MAX_NAME_LENGTH);
    const credentialTypeFactory = m.contract("CredentialTypeFactory", [
      maxNameLength,
    ]);
    return { credentialTypeFactory };
  }
);

export default CredentialTypeFactoryModule;
