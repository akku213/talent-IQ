import express from 'express';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import {serve} from "inngest/express";
import { inngest, functions } from "./lib/inngest.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());// Middleware to parse JSON bodies
app.use(cors({origin:ENV.CLIENT_URL, credentials:true})); // Enable CORS for the specified client URL with credentials support

app.use("/api/inngest", serve({client: inngest, functions})); // Inngest endpoint to handle incoming events

app.get("/health", (req, res) => {
    res.status(200).json({msg:"Health {Page"});
})

console.log("ENV.PORT =", ENV.PORT);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "frontend/dist/index.html"));
  });
}


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