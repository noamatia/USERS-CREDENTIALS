import { body, param } from "express-validator";
import { Router, Request, Response } from "express";
import { CredentialType } from "../models/credentialType";
import {
  getNumberOfCredentialTypes,
  getCredentialTypes,
  getUserCredentialsTypes,
  createCredentialType,
  assignCredential,
  verifyCredential,
} from "../controllers/credentialManagerController";

// Define response interfaces
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

// Interface for number of credential types response
interface NumberOfCredentialTypesData {
  numberOfCredentialTypes: number;
}

// Interface for credential types response
interface CredentialTypesData {
  credentialTypes: CredentialType[];
}

// Interface for user credential types response
interface UserCredentialTypesData {
  userCredentialTypes: CredentialType[];
}

// Interface for verification status response
interface VerificationStatusData {
  verificationStatus: boolean;
}

// Interface for creation or assignment response
interface AssignmentData {
  userAddress: string;
  credentialTypeId: number;
}

// Interface for creation data
interface CreationData {
  credentialTypeName: string;
}

const router = Router();

/**
 * @route GET /getNumberOfCredentialTypes
 * @desc Get the total number of credential types
 * @access Public
 * @returns {SuccessResponse<NumberOfCredentialTypesData>} Total number of credential types
 */
router.get(
  "/getNumberOfCredentialTypes",
  async (req: Request, res: Response) => {
    try {
      const numberOfCredentialTypes: number =
        await getNumberOfCredentialTypes();
      const response: SuccessResponse<NumberOfCredentialTypesData> = {
        success: true,
        data: {
          numberOfCredentialTypes,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error fetching credential types:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "An internal error occurred while fetching credential types.",
      };
      res.status(500).json(errorResponse);
    }
  }
);

/**
 * @route GET /getCredentialTypes
 * @desc Get all credential types
 * @access Public
 * @returns {SuccessResponse<CredentialTypesData>} List of credential types
 */
router.get("/getCredentialTypes", async (req: Request, res: Response) => {
  try {
    const credentialTypes: CredentialType[] = await getCredentialTypes();
    const response: SuccessResponse<CredentialTypesData> = {
      success: true,
      data: {
        credentialTypes,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("Error fetching credential types:", error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: "An internal error occurred while fetching credential types.",
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * @route GET /getUserCredentialsTypes/:userAddress
 * @desc Get all credential types for a specific user
 * @access Public
 * @param {string} userAddress - The user's wallet address
 * @returns {SuccessResponse<UserCredentialTypesData>} List of credential types assigned to the user
 */
router.get(
  "/getUserCredentialsTypes/:userAddress",
  [param("userAddress").isString().withMessage("Invalid user address.")],
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      const userCredentialTypes = await getUserCredentialsTypes(userAddress);
      const response: SuccessResponse<UserCredentialTypesData> = {
        success: true,
        data: {
          userCredentialTypes,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error fetching user credentials:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "An internal error occurred while fetching user credentials.",
      };
      res.status(500).json(errorResponse);
    }
  }
);

/**
 * @route GET /verifyCredential/:userAddress/:credentialTypeId
 * @desc Verify a credential for a given user and credential type ID
 * @access Public
 * @param {string} userAddress - The user's wallet address
 * @param {number} credentialTypeId - The ID of the credential type to verify
 * @returns {SuccessResponse<VerificationStatusData>} Verification status (true/false)
 */
router.get(
  "/verifyCredential/:userAddress/:credentialTypeId",
  async (req: Request, res: Response) => {
    try {
      const { userAddress } = req.params;
      const credentialTypeId = parseInt(req.params.credentialTypeId, 10); // Ensure correct type
      const verificationStatus = await verifyCredential(
        userAddress,
        credentialTypeId
      );
      const response: SuccessResponse<VerificationStatusData> = {
        success: true,
        data: {
          verificationStatus,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error verifying credential:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "An internal error occurred while verifying the credential.",
      };
      res.status(500).json(errorResponse);
    }
  }
);

/**
 * @route POST /createCredentialType
 * @desc Create a new credential type
 * @access Public
 * @param {string} credentialTypeName - The name of the credential type to create
 * @returns {SuccessResponse<CreationData>} Creation status with a success field and optional message
 */
router.post(
  "/createCredentialType",
  [
    body("credentialTypeName")
      .notEmpty()
      .withMessage("Credential type name is required."),
  ],
  async (req: Request, res: Response) => {
    try {
      const { credentialTypeName } = req.body;
      await createCredentialType(credentialTypeName);
      const response: SuccessResponse<CreationData> = {
        success: true,
        data: {
          credentialTypeName,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating credential type:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "An internal error occurred while creating the credential type.",
      };
      res.status(500).json(errorResponse);
    }
  }
);

/**
 * @route POST /assignCredential
 * @desc Assign a credential to a user
 * @access Public
 * @param {string} userAddress - The user's wallet address
 * @param {number} credentialTypeId - The ID of the credential type to assign
 * @returns {SuccessResponse<AssignmentData>} Assignment status with a success field
 */
router.post(
  "/assignCredential",
  [
    body("userAddress").isString().withMessage("Invalid user address."),
    body("credentialTypeId").isInt().withMessage("Invalid credential type ID."),
  ],
  async (req: Request, res: Response) => {
    try {
      const { userAddress, credentialTypeId } = req.body;
      await assignCredential(userAddress, credentialTypeId);
      const response: SuccessResponse<AssignmentData> = {
        success: true,
        data: {
          userAddress,
          credentialTypeId,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Error assigning credential:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "An internal error occurred while assigning the credential.",
      };
      res.status(500).json(errorResponse);
    }
  }
);

export default router;
