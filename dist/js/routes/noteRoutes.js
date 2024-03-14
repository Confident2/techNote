"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noteRouter = express_1.default.Router();
const noteController_1 = __importDefault(require("../controllers/noteController"));
const verifyJWT_1 = __importDefault(require("../middleware/verifyJWT"));
noteRouter.use(verifyJWT_1.default);
noteRouter
    .route("/")
    .get(noteController_1.default.getAllNotes) // read
    .post(noteController_1.default.createNewNote) // create
    .patch(noteController_1.default.updateNote) // update
    .delete(noteController_1.default.deleteNote); // delete
exports.default = noteRouter;
