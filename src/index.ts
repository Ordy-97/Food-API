import express from "express";
import App from './services/ExpressApp';
import dbConnection from './services/Database';
import { PORT } from "./config";

const Startserver = async () =>{
    const app = express();
    
    
    await App(app);
    
    
    app.listen(PORT, () => {
        console.clear()
        console.log(`App is listening to the port ${PORT}`);
    })
        
    await dbConnection();
}

Startserver();