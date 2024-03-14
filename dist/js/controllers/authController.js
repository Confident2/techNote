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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// @desc Login
// @route POST /auth
// @access Public
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    const foundUser = yield User_1.default.findOne({
        username,
    }).exec();
    if (!foundUser || !foundUser.active || foundUser === null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const match = yield bcrypt_1.default.compare(password, foundUser.password);
    if (!match)
        res.status(401).json({ message: "Unauthorized" });
    const accessToken = jsonwebtoken_1.default.sign({
        UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
        },
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ username: foundUser.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    // Create secure cookie with refresh token
    res.cookie("jwt", refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: "none", //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    });
    // Send accessToken containing username and roles
    res.json({ accessToken });
});
// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const refreshToken = cookies.jwt;
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (typeof decoded === "string") {
            throw new Error("Invalid token payload");
        }
        const foundUser = yield User_1.default.findOne({
            username: decoded.username,
        }).exec();
        if (!foundUser) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({
            UserInfo: {
                username: foundUser.username,
                roles: foundUser.roles,
            },
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.json({ accessToken });
    }
    catch (err) {
        res.status(403).json({ message: "Forbidden" });
    }
});
// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.sendStatus(204); //No content
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.json({ message: "Cookie cleared" });
};
exports.default = { login, refresh, logout };
