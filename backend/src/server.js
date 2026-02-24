import path from "path";
import express from "express";
import cors from "cors";
import { serve } from "inngest/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve root directory
const __dirname = path.resolve();

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);

/* -------------------- ROUTES -------------------- */

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is healthy 🚀" });
});

// Inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

/* -------------------- SERVE FRONTEND -------------------- */

// Serve React build files
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Handle React routing (MUST be last route)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

/* -------------------- START SERVER -------------------- */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();