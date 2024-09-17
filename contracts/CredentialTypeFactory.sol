// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/// @title CredentialTypeFactory Contract
/// @notice This contract allows the creation and management of credential types
/// @dev This contract stores credential types and allows users to add and retrieve credential types with validation
contract CredentialTypeFactory {
    /// @notice Maximum length allowed for credential names
    uint256 internal maxNameLength;

    /// @notice Structure to represent a credential type
    /// @param id Unique identifier for the credential type
    /// @param name the credential name
    struct CredentialType {
        uint256 id;
        string name;
    }

    /// @notice Array to store all created credential types
    CredentialType[] internal credentialTypes;

    /// @notice Emitted when a new credential type is created
    /// @param id Unique identifier of the created credential type
    /// @param name Name of the created credential type
    event CredentialTypeCreated(uint256 indexed id, string name);

    /// @notice Constructor to initialize the contract with a maximum name length
    /// @dev Ensures the provided `_maxNameLength` is greater than zero
    /// @param _maxNameLength Maximum allowed length for credential names
    constructor(uint256 _maxNameLength) {
        require(
            _maxNameLength > 0,
            "Max name length must be greater than zero"
        );
        maxNameLength = _maxNameLength;
    }

    /// @notice Returns the maximum length allowed for credential names
    /// @dev This function returns the value of the `maxNameLength` variable
    /// @return Number of characters allowed for credential names
    function getMaxNameLength() external view returns (uint256) {
        return maxNameLength;
    }

    /// @notice Returns the number of credential types
    /// @dev This function returns the length of the `credentialTypes` array
    /// @return Number of credential types
    function getNumberOfCredentialTypes() external view returns (uint256) {
        return credentialTypes.length;
    }

    /// @notice Returns an array of all credential types
    /// @dev This function returns the entire array of credential types stored in memory
    /// @return Array of `CredentialType` structs representing all credential types
    function getCredentialTypes()
        external
        view
        returns (CredentialType[] memory)
    {
        return credentialTypes;
    }

    /// @notice Returns a specific credential type by its id
    /// @dev Ensures the provided id is within the bounds of the `credentialTypes` array
    /// @param _id The id of the credential type to retrieve
    /// @return CredentialType struct corresponding to the provided id
    function getCredentialType(
        uint256 _id
    ) external view validCredentiaTypelId(_id) returns (CredentialType memory) {
        return credentialTypes[_id];
    }

    /// @notice Creates a new credential type
    /// @dev The name must be valid and unique, otherwise the transaction reverts
    /// @param _name The name of the credential type to be created
    function createCredentialType(
        string memory _name
    ) external validCredentialTypeName(_name) {
        uint256 id = credentialTypes.length;
        credentialTypes.push(CredentialType(id, _name));
        emit CredentialTypeCreated(id, _name);
    }

    /// @notice Internal function to check if a credential name is already taken
    /// @dev Compares the keccak256 hash of the provided name against keccak256 hash of the stored names
    /// @param _name The name of the credential to check
    /// @return Boolean value indicating whether the credential name is already taken
    function _isNameTaken(string memory _name) internal view returns (bool) {
        bytes32 nameHash = keccak256(bytes(_name));
        for (uint256 i = 0; i < credentialTypes.length; i++) {
            if (keccak256(bytes(credentialTypes[i].name)) == nameHash) {
                return true;
            }
        }
        return false;
    }

    /// @notice Internal function to check if a string is ASCII encoded
    /// @dev Loops through each byte of the string to verify its ASCII encoding
    /// @param byteStr The byte representation of the string to check
    /// @return Boolean value indicating whether the string is ASCII encoded
    function _isAscii(bytes memory byteStr) internal pure returns (bool) {
        for (uint256 i = 0; i < byteStr.length; i++) {
            if (uint8(byteStr[i]) > 127) {
                return false;
            }
        }
        return true;
    }

    /// @notice Modifier to validate a credential name
    /// @dev Ensures the name is ASCII, unique, and within the maximum length
    /// @param _name The name to validate
    modifier validCredentialTypeName(string memory _name) {
        bytes memory byteStr = bytes(_name);
        require(byteStr.length > 0, "Credential name cannot be empty");
        require(
            byteStr.length <= maxNameLength,
            "Credential name exceeds character limit"
        );
        require(_isAscii(byteStr), "Credential name must be ASCII");
        require(!_isNameTaken(_name), "Credential name must be unique");
        _;
    }

    /// @notice Checks if a credential type exists
    /// @dev Ensures the provided id is within the bounds of the `credentialTypes` array
    /// @param _id The id of the credential type to check
    modifier validCredentiaTypelId(uint256 _id) {
        require(_id < credentialTypes.length, "Invalid credential type ID");
        _;
    }
}
