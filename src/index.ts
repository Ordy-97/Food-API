import express from "express";
import App from './services/ExpressApp';
import dbConnection from './services/Database';

// require('dotenv').config();

import { PORT } from "./config";


const app = express();
const Startserver = async () =>{
    
    
    await App(app);
    
    
    app.listen(PORT, () => {
        console.clear()
        console.log(`App is listening to the port ${PORT}`);
    })
    
    await dbConnection();
    // console.log('MongoDB Password:', process.env.NODE_FOOD_API_PASSWORD_SECRET);
    
}

Startserver();

export default app;