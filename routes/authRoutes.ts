import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import loginLimiter from "../middleware/loginLimiter";

router.route("/").post(loginLimiter, authController.login);

router.route("/refresh").get(authController.refresh);

router.route("/logout").post(authController.logout);

export default router;
