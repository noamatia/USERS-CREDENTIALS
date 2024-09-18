import fs from "fs";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const merkleTreeJson = "merkleTree.json";

let merkleTree: StandardMerkleTree<string[]> | null = null;

/**
 * Loads the Merkle Tree from the JSON file if it exists, otherwise returns null.
 * If the Merkle tree is already loaded, it returns the cached instance.
 * @returns {StandardMerkleTree<string[]> | null} The loaded Merkle tree or null if it doesn't exist.
 */
function loadMerkleTree(): StandardMerkleTree<string[]> | null {
  if (fs.existsSync(merkleTreeJson) && !merkleTree) {
    const jsonData = fs.readFileSync(merkleTreeJson, "utf8");
    merkleTree = StandardMerkleTree.load(JSON.parse(jsonData));
    console.log("Merkle Tree loaded from JSON");
    return merkleTree;
  }
  return merkleTree;
}

/**
 * Retrieves the Merkle proof for the specified credential type ID.
 * @param {number} credentialTypeId - The ID of the credential type for which the proof is needed.
 * @returns {string[]} The Merkle proof for the given credential type ID.
 * @throws {Error} If the Merkle tree is not initialized.
 */
export function getProof(credentialTypeId: number): string[] {
  const tree = loadMerkleTree();
  if (!tree) {
    throw new Error("Merkle tree not initialized.");
  }
  return tree.getProof(credentialTypeId);
}

/**
 * Retrieves the Merkle root of the current Merkle tree.
 * @returns {string} The Merkle root of the tree.
 * @throws {Error} If the Merkle root is not initialized.
 */
export function getMerkleRoot(): string {
  const tree = loadMerkleTree();
  if (!tree) {
    throw new Error("Merkle root not initialized.");
  }
  return tree.root;
}

/**
 * Updates the Merkle tree with a new user and credential type ID pair.
 * If no Merkle tree exists, a new tree is initialized with the first value.
 * If the value already exists in the tree it throws an error.
 * @param {string} user - The address of the user to add to the tree.
 * @param {number} credentialTypeId - The credential type ID associated with the user.
 * * @throws {Error} If the entry already exists in the Merkle tree.
 * @returns {void}
 */
export function updateMerkleTree(user: string, credentialTypeId: number): void {
  let tree = loadMerkleTree();
  const newValue = [user, credentialTypeId.toString()];
  if (tree) {
    const values = Array.from(tree.entries()).map(([_, v]) => v);
    // Check if the entry already exists to avoid duplicates
    const entryExists = values.some(
      ([existingUser, existingId]) =>
        existingUser === user && existingId === credentialTypeId.toString()
    );
    if (entryExists) {
      throw new Error("Entry already exists in the Merkle tree.");
    }
    values.push(newValue);
    merkleTree = StandardMerkleTree.of(values, ["address", "uint256"]);
    console.log("Merkle Tree updated.");
  } else {
    // Initialize the Merkle tree with the first entry
    merkleTree = StandardMerkleTree.of([newValue], ["address", "uint256"]);
    console.log("Merkle Tree initialized with first entry.");
  }
  // Save the updated tree to the file
  fs.writeFileSync(merkleTreeJson, JSON.stringify(merkleTree.dump()));
  console.log("Merkle Tree saved to JSON file.");
}
