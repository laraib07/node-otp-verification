import express from 'express';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(cookieParser());

// Routes
import authRouter from './routes/auth.routes.js';

app.use('/auth' , authRouter);


export { app };