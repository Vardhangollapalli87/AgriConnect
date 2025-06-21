import express from 'express';
import { configDotenv } from 'dotenv';
import {connectDB} from './config/mongoDB.js';
import userRouter from './routes/userRoute.js';
import cookieparser from 'cookie-parser';
import cors from 'cors';

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();


app.use(express.json({ limit: '10mb' }));
app.use(cookieparser());

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
}));


// Define routes

app.use('/api/user', userRouter);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});