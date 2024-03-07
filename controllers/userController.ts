import { Request, Response } from "express";
import UserModel, { IUser } from "../models/User";
import NoteModel from "../models/Note";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcrypt";

interface IMessage {
  message: string;
}

const handleError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({ message } as IMessage);
};

const getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select("-password").lean();
    if (!users || users.length === 0) {
      res.status(400).json({ message: "No users found!" } as IMessage);
      return;
    }
    res.json(users);
  } catch (err) {
    handleError(res, 500, "Internal Server Error");
  }
});

const createUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { username, password, roles } = req.body;

  console.log("Request Body:", req.body);

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    res.status(400).json({ message: "All fields are required!" } as IMessage);
    return;
  }

  try {
    const existingUser = await UserModel.findOne({ username }).lean().exec();
    if (existingUser) {
      res.status(409).json({
        message: `User '${username}' already exists!`,
      } as IMessage);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userObject = { username, password: hashedPassword, roles } as IUser;

    const user = await UserModel.create(userObject);
    if (user) {
      res.status(201).json({ message: `New user ${username} created` });
    }
  } catch (err) {
    console.error("Error:", err);
    handleError(res, 400, "Invalid user data received");
  }
});

const updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id, username, roles, active, password } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const user = await UserModel.findById(id).exec();
    if (!user) {
      res.status(400).json({ message: "User not found" } as IMessage);
      return;
    }

    const duplicate = await UserModel.findOne({ username }).lean().exec();
    if (duplicate && duplicate._id.toString() !== id) {
      res.status(409).json({ message: "Duplicate username" });
      return;
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: `${username} updated` } as IMessage);
  } catch (err) {
    handleError(res, 500, "Internal Server Error");
  }
});

const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "User ID is required." });
    return;
  }

  try {
    const notes = await NoteModel.findOne({ user: id }).lean().exec();
    if (notes) {
      res.status(400).json({ message: "User has assigned notes" });
      return;
    }

    const user = await UserModel.findById(id).exec();
    if (!user) {
      res.status(400).json({ message: `No user matches ID ${id}.` });
      return;
    }

    const username = user.username;
    await user.deleteOne();

    res.json({ message: `Username ${username} with ID ${id} deleted` });
  } catch (err) {
    handleError(res, 500, "Internal Server Error");
  }
});

export default {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
