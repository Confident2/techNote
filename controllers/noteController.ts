import { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import User from "../models/User";
import expressAsyncHandler from "express-async-handler";

// @desc Get all notes
// @route GET /notes
// @access Private
interface NoteMessage {
  message: string;
}

const handleError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({ message } as NoteMessage);
};

const getAllNotes = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // Get all notes from MongoDB
    try {
      const notes = await Note.find().lean();

      // If no notes
      if (!notes?.length) {
        res.status(400).json({ message: "No notes found" });
        return Promise.resolve();
      }

      // Add username to each note before sending the response
      const notesWithUser = await Promise.all(
        notes.map(async (note: any) => {
          const user = await User.findById(note.user).lean().exec();
          return { ...note, username: user?.username };
        })
      );

      res.json(notesWithUser);
    } catch (err) {
      handleError(res, 500, "Internal Server Error");
    }
  }
);

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { user, title, text } = req.body;

    // Confirm data
    if (!user || !title || !text) {
      res.status(400).json({ message: "All fields are required" });
      return Promise.resolve();
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec();

    if (duplicate) {
      res.status(409).json({ message: "Duplicate note title" });
      return Promise.resolve();
    }

    // Create and store the new note
    const note = await Note.create({ user, title, text } as INote);

    if (note) {
      // Created
      res.status(201).json({ message: "New note created" });
      return Promise.resolve();
    } else {
      res.status(400).json({ message: "Invalid note data received" });
      return Promise.resolve();
    }
  }
);

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id, user, title, text, completed } = req.body;

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== "boolean") {
      res.status(400).json({ message: "All fields are required" });
      return Promise.resolve();
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec();

    if (!note) {
      res.status(400).json({ message: "Note not found" });
      return Promise.resolve();
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec();

    // Allow renaming of the original note
    if (duplicate && duplicate?._id.toString() !== id) {
      res.status(409).json({ message: "Duplicate note title" });
      return Promise.resolve();
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;

    const updatedNote = await note.save();

    res.json(`'${updatedNote.title}' updated`);
  }
);

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.body;

    // Confirm data
    if (!id) {
      res.status(400).json({ message: "Note ID required" });
      return Promise.resolve();
    }

    // Confirm note exists to delete
    const note = await Note.findById(id).exec();

    if (!note) {
      res.status(400).json({ message: "Note not found" });
      return Promise.resolve();
    }
    const title = note.title;
    const _id = note.id;
    await note.deleteOne();

    const reply = `Note '${title}' with ID ${_id} deleted`;

    res.json(reply);
  }
);

export default { getAllNotes, createNewNote, updateNote, deleteNote };
