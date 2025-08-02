import { Router } from "express";
import { createUser, loginUser, updateUserBio } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = Router();
router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/bio").put(authMiddleware, updateUserBio);
export default router;
