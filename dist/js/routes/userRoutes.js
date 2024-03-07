"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
const userController_1 = __importDefault(require("../controllers/userController"));
userRouter
    .route("/")
    .get(userController_1.default.getAllUsers) // read
    .post(userController_1.default.createUser) // create
    .patch(userController_1.default.updateUser) // update
    .delete(userController_1.default.deleteUser); // delete
exports.default = userRouter;
