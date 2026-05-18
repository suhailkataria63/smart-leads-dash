import cors from "cors";
import express from "express";

import { errorHandler } from "./middlewares/errorHandler.js";
import { healthRouter } from "./routes/health.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);

app.use(errorHandler);

export { app };

