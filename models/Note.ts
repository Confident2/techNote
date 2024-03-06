import mongoose, { Schema, Document, Types } from "mongoose";
import AutoIncrement from "mongoose-sequence";

// Define the type for User ID
type UserID = Types.ObjectId;

export interface INote extends Document {
  user: UserID;
  text: string;
  title: string;
  refreshToken?: string | null;
  active: boolean;
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
    active: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
  },
  { timestamps: true }
);

interface AutoIncrementOptions {
  inc_field: string;
  id: string;
  start_seq: number;
}

noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
} as AutoIncrementOptions);

const NoteModel = mongoose.model<INote>("Note", noteSchema);
export default NoteModel;
