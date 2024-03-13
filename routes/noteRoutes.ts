import express from "express";
const noteRouter = express.Router();
import noteController from "../controllers/noteController";
import verifyJWT from "../middleware/verifyJWT";

noteRouter.use(verifyJWT);

noteRouter
  .route("/")
  .get(noteController.getAllNotes) // read
  .post(noteController.createNewNote) // create
  .patch(noteController.updateNote) // update
  .delete(noteController.deleteNote); // delete

export default noteRouter;
