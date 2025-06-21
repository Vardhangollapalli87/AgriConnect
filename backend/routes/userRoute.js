import express from 'express';
import { login, signup, logout, updateProfile } from '../controllers/userController.js';
import authRoute from '../middleware/authRoute.js'; // Make sure this path is correct

const userRouter = express.Router();

// define routes for user operations

userRouter.post('/login', login);
userRouter.post('/signup', signup);
userRouter.post('/logout', logout);
userRouter.post('/update-profile', authRoute, updateProfile);

export default userRouter;