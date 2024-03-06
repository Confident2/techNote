import mongoose, { Schema, Document } from "mongoose";

// Define roles
enum UserRole {
  User = "Employee",
}

// Define the IUser interface extending Document
export interface IUser extends Document {
  username: string;
  roles: UserRole[];
  password: string;
  refreshToken?: string | null;
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
      type: [{ type: String, enum: Object.values(UserRole) }], // Validate roles against the enum values
      default: [UserRole.User], // Default role is User
    },
    active: {
      type: Boolean,
      default: true,
    },

    refreshToken: String,
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
