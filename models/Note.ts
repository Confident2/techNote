import mongoose, { Schema, Document, Types } from "mongoose";
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Define the type for User ID
type UserID = Types.ObjectId;

export interface INote extends Document {
  user: UserID;
  text: string;
  title: string;
  refreshToken?: string | null;
  completed: boolean;
}

const noteSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

interface AutoIncrementOptions {
  inc_field: string;
  id: string;
  start_seq: number;
}

// Pass the mongoose instance to the mongoose-sequence plugin
const autoIncrementOptions: AutoIncrementOptions = {
  id: "note_seq",
  inc_field: "ticket",
  start_seq: 500,
};
noteSchema.plugin(AutoIncrement, {
  mongoose: mongoose,
  ...autoIncrementOptions,
});

const NoteModel = mongoose.model<INote>("Note", noteSchema);
export default NoteModel;
