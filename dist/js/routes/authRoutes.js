"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = __importDefault(require("../controllers/authController"));
const loginLimiter_1 = __importDefault(require("../middleware/loginLimiter"));
router.route("/").post(loginLimiter_1.default, authController_1.default.login);
router.route("/refresh").get(authController_1.default.refresh);
router.route("/logout").post(authController_1.default.logout);
exports.default = router;
