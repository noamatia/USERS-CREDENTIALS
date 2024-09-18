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
    /// @dev This contract interacts with the CredentialTypeFactory contract to manage credential types
    CredentialTypeFactory internal immutable credentialTypeFactory;

    /// @notice Merkle root used to verify the credential data
    /// @dev The Merkle root is set by the contract owner
    bytes32 internal merkleRoot;

    /// @notice Mapping of user addresses to credential type IDs
    /// @dev Stores the credential types assigned to each user
    mapping(address => mapping(uint256 => bool)) internal userCredentials;

    /// @notice Array to store the credential type IDs assigned to each user
    /// @dev Used to retrieve the list of credential types assigned to a user
    mapping(address => uint256[]) internal userCredentialList;

    /// @notice Emitted when a new credential is assigned to a user
    /// @dev This event is emitted when a new credential is assigned to a user
    /// @param user Address of the user receiving the credential
    /// @param credentialTypeId ID of the credential type being assigned
    event CredentialAssigned(
        address indexed user,
        uint256 indexed credentialTypeId
    );

    /// @notice Emitted when the Merkle root is updated
    /// @dev This event is emitted when the Merkle root is updated
    /// @param newMerkleRoot The new Merkle root value
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    /// @notice Constructor to initialize the CredentialManager contract
    /// @dev Sets the address of the CredentialTypeFactory contract
    /// @param _credentialTypeFactoryAddress Address of the deployed CredentialTypeFactory contract
    constructor(address _credentialTypeFactoryAddress) Ownable(msg.sender) {
        credentialTypeFactory = CredentialTypeFactory(
            _credentialTypeFactoryAddress
        );
    }

    /// @notice Sets the Merkle root used to verify the credential data
    /// @dev Only the contract owner can call this function
    /// @param _merkleRoot The new Merkle root to be set
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    /// @notice Retrieves the address of the CredentialTypeFactory contract
    /// @dev Returns the address of the CredentialTypeFactory contract
    /// @return Address of the CredentialTypeFactory contract
    function getCredentialTypeFactoryAddress() external view returns (address) {
        return address(credentialTypeFactory);
    }

    /// @notice Returns the number of credential types available in the factory
    /// @dev This function returns the number of credential types stored in the CredentialTypeFactory contract
    /// @return Number of credential types
    function getNumberOfCredentialTypes() external view returns (uint256) {
        return credentialTypeFactory.getNumberOfCredentialTypes();
    }

    /// @notice Retrieves the list of all available credential types
    /// @dev This function returns an array of CredentialType structs available in the factory
    /// @return Array of CredentialType structs available in the factory
    function getCredentialTypes()
        external
        view
        returns (CredentialTypeFactory.CredentialType[] memory)
    {
        return credentialTypeFactory.getCredentialTypes();
    }

    /// @notice Retrieves the list of credential types assigned to a user
    /// @dev This function returns an array of CredentialType structs assigned to the user
    /// @param _user Address of the user whose credentials are being retrieved
    /// @return Array of CredentialType structs assigned to the user
    function getUserCredentialsTypes(
        address _user
    ) external view returns (CredentialTypeFactory.CredentialType[] memory) {
        uint256 numCredentials = userCredentialList[_user].length;
        CredentialTypeFactory.CredentialType[]
            memory userCredentialsTypes = new CredentialTypeFactory.CredentialType[](
                numCredentials
            );
        for (uint256 i = 0; i < numCredentials; i++) {
            uint256 credentialTypeId = userCredentialList[_user][i];
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
        userCredentials[_user][_credentialTypeId] = true;
        userCredentialList[_user].push(_credentialTypeId);
        emit CredentialAssigned(_user, _credentialTypeId);
    }

    /// @notice Verifies whether a user's credential is valid using Merkle Proof
    /// @dev Verifies the credential data using the Merkle proof and the Merkle root
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
        return
            userCredentials[_user][_credentialTypeId] &&
            MerkleProof.verify(_merkleProof, merkleRoot, _leaf);
    }

    /// @notice Modifier to ensure a credential is valid before assignment
    /// @dev Ensures that the credential type exists and that the user does not already have this credential type assigned
    /// @param _user The address of the user to whom the credential is being assigned
    /// @param _credentialTypeId The ID of the credential type being assigned
    modifier validAssignment(address _user, uint256 _credentialTypeId) {
        require(
            credentialTypeFactory.isValidCredentialTypeId(_credentialTypeId),
            "Invalid credential type ID"
        );
        require(
            !userCredentials[_user][_credentialTypeId],
            "Credential already assigned"
        );
        _;
    }
}
