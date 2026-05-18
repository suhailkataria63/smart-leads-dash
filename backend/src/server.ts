import dotenv from "dotenv";

import { app } from "./app.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDb();

  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

