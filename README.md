# User Credentials

## Project Overview

**User Credentials** is a blockchain-based application designed to manage user credentials using Solidity smart contracts. The contracts are tested and deployed using Hardhat and TypeScript. Additionally, an Express server exposes APIs to interact with the deployed contracts, allowing efficient management of credentials via RESTful services.

### Features

- **Solidity Contracts**: Manages credential types and user credentials using smart contracts.
- **Hardhat Framework**: Used for testing, deployment, and interaction with the contracts.
- **Express API**: A server exposing APIs to communicate with the deployed contracts.
- **TypeScript Integration**: Ensures type safety and maintainability throughout the project.

### Future Work

- **Use IPFS for enabling credential type metadata**
- **Use centrelized/decentrelized for storing the Merkle Tree**: Currently is stores locally off-chain
- **Dockerize the project**
- **Add user interface**
- **Write e2e and integration tests**

## Installation

### Prerequisites

- **Node.js**
- **npm**
- **Hardhat**
- **TypeScript**

### Clone the repository

```bash
git clone https://github.com/noamatia/USERS-CREDENTIALS.git
cd USERS-CREDENTIALS
```

### Install ependencies

```bash
npm install
```

## Running the Project

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat coverage
```

### Cleanup (DELETE ALL PREVIOUS DEPLOYMENTS AND LOCAL DATA)

Use only if you desire to run a brand new project!!!

```bash
./cleanup.sh
```

### Deploy Contracts

Use [Hardhat documentation](https://hardhat.org/hardhat-runner/docs/guides/verifying) about how to get API keys and deploy the contract to **SEPOLIA** testnet

```bash
$ npx hardhat vars set ETHERSCAN_API_KEY
✔ Enter value: ********************************
```

```bash
$ npx hardhat vars set INFURA_API_KEY
✔ Enter value: ********************************
```

```bash
$ npx hardhat vars set SEPOLIA_PRIVATE_KEY
✔ Enter value: ********************************
```

To deploy the smart contracts to a network, run the following command:

```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

Replace ```<network-name>``` with your desired network (localhost or sepolia)

## Express Server

The project includes an Express server that provides APIs to interact with the deployed contracts.

### Running the Express Server

```bash
npx hardhat run --network <network-name> src/app.ts
```

Replace ```<network-name>``` with your desired network (localhost or sepolia)

The server will start at http://localhost:3000 (default port)

### API Endpoints

For your convenience ```postman_collection.json``` can be imported into Postman for teating

1. **GET `/api/getNumberOfCredentialTypes`**
   - **Description**: Retrieve the total number of credential types.

2. **GET `/api/getCredentialTypes`**
   - **Description**: Retrieve all credential types.

3. **GET `/api/getUserCredentialsTypes/:userAddress`**
   - **Description**: Retrieve all credential types assigned to a specific user.
   - **Parameters**:
     - `userAddress`: The user's Ethereum wallet address.

4. **GET `/api/verifyCredential/:userAddress/:credentialTypeId`**
   - **Description**: Verify a credential for a given user and credential type ID.
   - **Parameters**:
     - `userAddress`: The user's Ethereum wallet address.
     - `credentialTypeId`: The ID of the credential type.

5. **POST `/api/createCredentialType`**
   - **Description**: Create a new credential type.
   - **Body**:
     - `credentialTypeName`: The name of the credential type.

6. **POST `/api/assignCredential`**
   - **Description**: Assign a credential to a user.
   - **Body**:
     - `userAddress`: The user's Ethereum wallet address.
     - `credentialTypeId`: The ID of the credential type.

7. **GET `/api/getOwnerAddress`**
   - **Description**: Retrieve the address of the contract owner.

8. **GET `/api/getUsersAddresses`**
   - **Description**: Retrieve the addresses of all users.

9. **GET `/api/getUserBalance/:userAddress`**
   - **Description**: Retrieve the Ether balance of a user.
   - **Parameters**:
     - `userAddress`: The user's Ethereum wallet address.

## License

This project is licensed under the UNLICENSED License.
