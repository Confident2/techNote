import express from "express";
const userRouter = express.Router();
import userController from "../controllers/userController";

userRouter
  .route("/")
  .get(userController.getAllUsers) // read
  .post(userController.createUser) // create
  .patch(userController.updateUser) // update
  .delete(userController.deleteUser); // delete

export default userRouter;
