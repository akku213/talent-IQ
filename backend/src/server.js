import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

console.log("=== Path Debug Info ===");
console.log("__filename:", __filename);
console.log("__dirname:", __dirname);
console.log("projectRoot:", projectRoot);
console.log("frontend dist path:", path.join(projectRoot, "frontend/dist"));
console.log("index.html path:", path.join(projectRoot, "frontend/dist/index.html"));
console.log("======================");

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});



// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(projectRoot, "frontend/dist")));

  app.use((req, res) => {
    res.sendFile(path.join(projectRoot, "frontend/dist/index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();