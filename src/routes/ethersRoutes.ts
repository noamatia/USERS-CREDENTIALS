import { param } from "express-validator";
import { Router, Request, Response, NextFunction } from "express";
import * as ethersController from "../controllers/ethersController";
import { validateRequest } from "../middlewares/validateRequestMiddleware";

// Define success response interfaces
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Interface owner address response
interface OwnerAddressTypesData {
  ownerAddress: string;
}

// Interface for users addresses response
interface UsersAddressesData {
  usersAddresses: string[];
}

// Interface for user balance response
interface UserBalanceData {
  userAddress: string;
  userBalance: number;
}

// Helper function to validate Ethereum addresses
const isEthereumAddress = (value: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};

const router = Router();

/**
 * @route GET /getOwnerAddress
 * @desc Get the address of the contract owner
 * @access Public
 * @returns {SuccessResponse<OwnerAddressTypesData>} The address of the contract owner
 */
router.get(
  "/getOwnerAddress",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerAddress: string = await ethersController.getOwnerAddress();
      const response: SuccessResponse<OwnerAddressTypesData> = {
        success: true,
        data: {
          ownerAddress,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /getUsersAddresses
 * @desc Get all users addresses
 * @access Public
 * @returns {SuccessResponse<UsersAddressesData>} List of users addresses
 */
router.get(
  "/getUsersAddresses",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usersAddresses: string[] =
        await ethersController.getUsersAddresses();
      const response: SuccessResponse<UsersAddressesData> = {
        success: true,
        data: {
          usersAddresses,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /getUserBalance/:userAddress
 * @desc Get the balance of a user in Ether
 * @access Public
 * @param {string} userAddress - The user's wallet address
 * @returns {SuccessResponse<UserBalanceData>} The balance of the user
 */
router.get(
  "/getUserBalance/:userAddress",
  [
    param("userAddress")
      .custom(isEthereumAddress)
      .withMessage("Invalid Ethereum address"),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userAddress } = req.params;
      const userBalance = await ethersController.getUserBalance(userAddress);
      const response: SuccessResponse<UserBalanceData> = {
        success: true,
        data: {
          userAddress,
          userBalance,
        },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
