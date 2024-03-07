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
const handleError = (res, statusCode, message) => {
    console.error(message);
    res.status(statusCode).json({ message });
};
const getAllUsers = (req, res) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const users = yield User_1.default.find().select("-password").lean();
            if (!users || users.length === 0) {
                return res.status(400).json({ message: "No user found!" });
            }
            res.json(users);
            resolve();
        }
        catch (err) {
            handleError(res, 500, "Internal Server Error");
            reject(err);
        }
    }));
};
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, roles } = req.body;
        // Confirming data
        if (!username || !password || !Array.isArray(roles) || !roles.length) {
            res.status(400).json({ message: "All fields are required!" });
            return Promise.resolve();
        }
        // Check if username already exists
        const existingUser = yield User_1.default.findOne({ username }).lean().exec();
        if (existingUser) {
            res.status(409).json({ message: `User '${username}' already exists!` });
            return Promise.resolve();
        }
        const user = yield User_1.default.create({ username, password, roles });
        res.status(201).json(user);
        return Promise.resolve();
    }
    catch (err) {
        handleError(res, 500, "Internal Server Error");
        return Promise.resolve();
    }
});
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield createUser(req, res);
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({ message: "User ID is required." });
            return;
        }
        const user = yield User_1.default.findOne({ _id: id }).exec();
        if (!user) {
            res.status(400).json({ message: `No user matches ID ${id}.` });
            return;
        }
        const result = yield user.deleteOne({ _id: id });
        res.json(result);
    }
    catch (err) {
        handleError(res, 500, "Internal Server Error");
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "User ID is required." });
            return;
        }
        const user = yield User_1.default.findOne({ _id: id }).exec();
        if (!user) {
            res.status(204).json({ message: `No user matches ID ${id}.` });
            return;
        }
        res.json(user);
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
    getUser,
};
