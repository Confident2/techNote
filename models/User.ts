import mongoose, { Schema, Document } from "mongoose";

// Define the IUser interface extending Document
export interface IUser extends Document {
  username: string;
  roles: string[];
  password: string;
  active: boolean;
}

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      default: ["Employee"],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
