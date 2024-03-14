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
const User_1 = __importDefault(require("../models/User"));
const Note_1 = __importDefault(require("../models/Note"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const handleError = (res, statusCode, message) => {
    res.status(statusCode).json({ message });
};
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().select("-password").lean();
        if (!users || users.length === 0) {
            res.status(400).json({ message: "No users found!" });
            return;
        }
        res.json(users);
    }
    catch (err) {
        handleError(res, 500, "Internal Server Error");
    }
});
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, roles } = req.body;
    console.log("Request Body:", req.body);
    if (!username || !password) {
        res.status(400).json({ message: "All fields are required!" });
        return;
    }
    try {
        const existingUser = yield User_1.default.findOne({ username })
            .collation({ locale: "en", strength: 2 })
            .lean()
            .exec();
        if (existingUser) {
            res.status(409).json({
                message: `User '${username}' already exists!`,
            });
            return;
        }
        //Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const userObject = !Array.isArray(roles) || !roles.length
            ? { username, password: hashedPassword }
            : { username, password: hashedPassword, roles };
        // Create and store new user
        const user = yield User_1.default.create(userObject);
        if (user) {
            res.status(201).json({ message: `New user ${username} created` });
        }
    }
    catch (err) {
        console.error("Error:", err);
        handleError(res, 400, "Invalid user data received");
    }
});
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, username, roles, active, password } = req.body;
    if (!id ||
        !username ||
        !Array.isArray(roles) ||
        !roles.length ||
        typeof active !== "boolean") {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    try {
        const user = yield User_1.default.findById(id).exec();
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const duplicate = yield User_1.default.findOne({ username })
            .collation({ locale: "en", strength: 2 })
            .lean()
            .exec();
        if (duplicate && duplicate._id.toString() !== id) {
            res.status(409).json({ message: "Duplicate username" });
            return;
        }
        user.username = username;
        user.roles = roles;
        user.active = active;
        if (password) {
            user.password = yield bcrypt_1.default.hash(password, 10);
        }
        yield user.save();
        res.status(200).json({ message: `${username} updated` });
    }
    catch (err) {
        handleError(res, 500, "Internal Server Error");
    }
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!id) {
        res.status(400).json({ message: "User ID is required." });
        return;
    }
    try {
        const notes = yield Note_1.default.findOne({ user: id }).lean().exec();
        if (notes) {
            res.status(400).json({ message: "User has assigned notes" });
            return;
        }
        const user = yield User_1.default.findById(id).exec();
        if (!user) {
            res.status(400).json({ message: `No user matches ID ${id}.` });
            return;
        }
        const username = user.username;
        const _id = user.id;
        yield user.deleteOne();
        res.json({ message: `Username ${username} with ID ${_id} deleted` });
    }
    catch (err) {
        handleError(res, 500, "Internal Server Error");
    }
});
exports.default = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
};
