import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials: true
}));



app.use(express.json({limit: "20kb"}));   
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

//routes
import userRoutes from './routes/user.routes.js';

//routes declaration
app.use('/api/v1/users', userRoutes);

export {app};