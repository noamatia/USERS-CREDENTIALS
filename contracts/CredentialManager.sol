// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./CredentialTypeFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title CredentialManager Contract
/// @notice This contract manages the creation, assignment, and verification of user credentials
/// @dev Uses the CredentialTypeFactory contract for managing credential types and Merkle Proofs for validation
contract CredentialManager is Ownable {
    /// @notice Instance of the CredentialTypeFactory contract
    CredentialTypeFactory internal credentialTypeFactory;

    /// @notice Merkle root used to verify the credential data
    bytes32 internal merkleRoot;

    /// @notice Struct representing a user's credential
    /// @param user Address of the user
    /// @param credentialTypeId ID of the credential type
    struct UserCredential {
        address user;
        uint256 credentialTypeId;
    }

    /// @notice Mapping from user address to an array of credentials
    /// @dev Each user can have multiple credentials
    mapping(address => UserCredential[]) internal userCredentials;

    /// @notice Emitted when a new credential is assigned to a user
    /// @param user Address of the user receiving the credential
    /// @param credentialTypeId ID of the credential type being assigned
    event CredentialAssigned(
        address indexed user,
        uint256 indexed credentialTypeId
    );

    /// @notice Constructor to initialize the CredentialManager contract
    /// @param _credentialTypeFactoryAddress Address of the deployed CredentialTypeFactory contract
    /// @param _merkleRoot Merkle root used to verify the credential data
    constructor(
        address _credentialTypeFactoryAddress,
        bytes32 _merkleRoot
    ) Ownable(msg.sender) {
        credentialTypeFactory = CredentialTypeFactory(
            _credentialTypeFactoryAddress
        );
        merkleRoot = _merkleRoot;
    }

    /// @notice Retrieves the address of the CredentialTypeFactory contract
    /// @return Address of the CredentialTypeFactory contract
    function getCredentialTypeFactoryAddress() external view returns (address) {
        return address(credentialTypeFactory);
    }

    /// @notice Returns the number of credential types available in the factory
    /// @return Number of credential types
    function getNumberOfCredentialTypes() external view returns (uint256) {
        return credentialTypeFactory.getNumberOfCredentialTypes();
    }

    /// @notice Retrieves the list of all available credential types
    /// @return Array of CredentialType structs available in the factory
    function getCredentialTypes()
        external
        view
        returns (CredentialTypeFactory.CredentialType[] memory)
    {
        return credentialTypeFactory.getCredentialTypes();
    }

    /// @notice Retrieves the list of credential types assigned to a user
    /// @param _user Address of the user whose credentials are being retrieved
    /// @return Array of CredentialType structs assigned to the user
    function getUserCredentialsTypes(
        address _user
    ) external view returns (CredentialTypeFactory.CredentialType[] memory) {
        uint256 numCredentials = userCredentials[_user].length;
        CredentialTypeFactory.CredentialType[]
            memory userCredentialsTypes = new CredentialTypeFactory.CredentialType[](
                numCredentials
            );
        for (uint256 i = 0; i < numCredentials; i++) {
            uint256 credentialTypeId = userCredentials[_user][i]
                .credentialTypeId;
            userCredentialsTypes[i] = credentialTypeFactory.getCredentialType(
                credentialTypeId
            );
        }
        return userCredentialsTypes;
    }

    /// @notice Allows the owner to create a new credential type
    /// @dev Only the contract owner can call this function
    /// @param _name The name of the new credential type to be created
    function createCredentialType(string memory _name) external onlyOwner {
        credentialTypeFactory.createCredentialType(_name);
    }

    /// @notice Assigns a credential to a user
    /// @dev Only the owner can assign credentials. The credential must be unique for the user.
    /// @param _user The address of the user receiving the credential
    /// @param _credentialTypeId ID of the credential type being assigned
    function assignCredential(
        address _user,
        uint256 _credentialTypeId
    ) external onlyOwner validAssignment(_user, _credentialTypeId) {
        userCredentials[_user].push(
            UserCredential({user: _user, credentialTypeId: _credentialTypeId})
        );
        emit CredentialAssigned(_user, _credentialTypeId);
    }

    /// @notice Verifies whether a user's credential is valid using Merkle Proof
    /// @param _user The address of the user whose credential is being verified
    /// @param _credentialTypeId ID of the credential type being verified
    /// @param _merkleProof The Merkle proof used to verify the credential data
    /// @return Boolean indicating whether the credential is valid
    function verifyCredential(
        address _user,
        uint256 _credentialTypeId,
        bytes32[] memory _merkleProof
    ) external view returns (bool) {
        bytes32 _leaf = keccak256(
            bytes.concat(keccak256(abi.encode(_user, _credentialTypeId)))
        );
        UserCredential[] memory credentials = userCredentials[_user];
        for (uint256 i = 0; i < credentials.length; i++) {
            if (
                credentials[i].credentialTypeId == _credentialTypeId &&
                MerkleProof.verify(_merkleProof, merkleRoot, _leaf)
            ) {
                return true;
            }
        }
        return false;
    }

    /// @notice Modifier to ensure a credential is valid before assignment
    /// @dev Ensures that the credential type exists and that the user does not already have this credential type assigned
    /// @param _user The address of the user to whom the credential is being assigned
    /// @param _credentialTypeId The ID of the credential type being assigned
    modifier validAssignment(address _user, uint256 _credentialTypeId) {
        CredentialTypeFactory.CredentialType
            memory credentialType = credentialTypeFactory.getCredentialType(
                _credentialTypeId
            );
        for (uint256 i = 0; i < userCredentials[_user].length; i++) {
            require(
                userCredentials[_user][i].credentialTypeId != credentialType.id,
                "Credential already assigned"
            );
        }
        _;
    }
}
