import express from 'express';
import { signup } from '../controllers/farmerController';

const userRouter = express.Router();


// define routes for user operations

userRouter.get('/login',login);
userRouter.get('/signup',signup);
userRouter.get('/update-profile',authRoute,profile);



export default userRouter;