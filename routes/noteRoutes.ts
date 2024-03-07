import express from "express";
const noteRouter = express.Router();
import userController from "../controllers/userController";

noteRouter
  .route("/")
  .get(noteController.getAllUsers) // read
  .post(noteController.createUser) // create
  .patch(noteController.updateUser) // update
  .delete(noteController.deleteUser); // delete

export default noteRouter;
