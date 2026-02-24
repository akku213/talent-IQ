import express from 'express';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express();


app.get("/health", (req, res) => {
    res.status(200).json({msg:"Health {Page"});
})

console.log("ENV.PORT =", ENV.PORT);

const startServer = async () => {
    try{
        await connectDB();
        app.listen(ENV.PORT, () => {
        console.log(`Server is running on port ${ENV.PORT}`);
    })
    }
    catch(error){
        console.log("Error starting the server", error);
    }
}

startServer();