import { Router } from "express";

import { getProfile, login, register } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateLogin, validateRegister } from "../middlewares/validateAuth.js";

const authRouter = Router();

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.get("/profile", authenticate, getProfile);

export { authRouter };
