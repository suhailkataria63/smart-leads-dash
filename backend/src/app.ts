import cors from "cors";
import express from "express";

import { errorHandler } from "./middlewares/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { leadRouter } from "./routes/lead.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/leads", leadRouter);

app.use(errorHandler);

export { app };
