import express from 'express';
import {
  authUser,
  getUserProfile,
  updateUserProfile,
  registerUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//@desc Authenticate and login users
//@route /api/users/login
//@access Public
router.route('/').post(registerUser);
router.route('/login').post(authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
