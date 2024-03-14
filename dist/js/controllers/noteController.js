"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Note_1 = __importDefault(require("../models/Note"));
const User_1 = __importDefault(require("../models/User"));
const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({ message });
};
const getAllNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all notes from MongoDB
    try {
        const notes = yield Note_1.default.find().lean();
        // If no notes
        if (!(notes === null || notes === void 0 ? void 0 : notes.length)) {
            res.status(400).json({ message: "No notes found" });
            return Promise.resolve();
        }
        // Add username to each note before sending the response
        const notesWithUser = yield Promise.all(notes.map((note) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield User_1.default.findById(note.user).lean().exec();
            return Object.assign(Object.assign({}, note), { username: user === null || user === void 0 ? void 0 : user.username });
        })));
        res.json(notesWithUser);
    }
    catch (err) {
        handleError(res, 500, "Internal Server Error");
    }
});
// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, title, text } = req.body;
    // Confirm data
    if (!user || !title || !text) {
        res.status(400).json({ message: "All fields are required" });
        return Promise.resolve();
    }
    // Check for duplicate title
    const duplicate = yield Note_1.default.findOne({ title })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec();
    if (duplicate) {
        res.status(409).json({ message: "Duplicate note title" });
        return Promise.resolve();
    }
    // Create and store the new note
    const note = yield Note_1.default.create({ user, title, text });
    if (note) {
        // Created
        res.status(201).json({ message: "New note created" });
        return Promise.resolve();
    }
    else {
        res.status(400).json({ message: "Invalid note data received" });
        return Promise.resolve();
    }
});
// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, user, title, text, completed } = req.body;
    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== "boolean") {
        res.status(400).json({ message: "All fields are required" });
        return Promise.resolve();
    }
    // Confirm note exists to update
    const note = yield Note_1.default.findById(id).exec();
    if (!note) {
        res.status(400).json({ message: "Note not found" });
        return Promise.resolve();
    }
    // Check for duplicate title
    const duplicate = yield Note_1.default.findOne({ title })
        .collation({ locale: "en", strength: 2 })
        .lean()
        .exec();
    // Allow renaming of the original note
    if (duplicate && (duplicate === null || duplicate === void 0 ? void 0 : duplicate._id.toString()) !== id) {
        res.status(409).json({ message: "Duplicate note title" });
        return Promise.resolve();
    }
    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;
    const updatedNote = yield note.save();
    res.json(`'${updatedNote.title}' updated`);
});
// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    // Confirm data
    if (!id) {
        res.status(400).json({ message: "Note ID required" });
        return Promise.resolve();
    }
    // Confirm note exists to delete
    const note = yield Note_1.default.findById(id).exec();
    if (!note) {
        res.status(400).json({ message: "Note not found" });
        return Promise.resolve();
    }
    const title = note.title;
    const _id = note.id;
    yield note.deleteOne();
    const reply = `Note '${title}' with ID ${_id} deleted`;
    res.json(reply);
});
exports.default = { getAllNotes, createNewNote, updateNote, deleteNote };
