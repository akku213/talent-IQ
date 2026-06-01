import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      // If user doesn't exist, create them automatically
      if (!user) {
        console.log("User not found in DB, creating new user for clerkId:", clerkId);

        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkId);

        const userData = {
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
          profileImage: clerkUser.imageUrl || "",
        };

        // Create user in MongoDB
        user = await User.create(userData);
        console.log("User created in DB:", user);

        // Create user in Stream
        try {
          await upsertStreamUser({
            id: clerkId,
            name: userData.name,
            image: userData.profileImage,
          });
          console.log("User synced to Stream");
        } catch (streamError) {
          console.error("Error syncing user to Stream:", streamError);
          // Don't fail the request if Stream sync fails
        }
      }

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];