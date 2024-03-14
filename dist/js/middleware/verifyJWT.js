"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        console.error("Invalid Authorization Header:", authHeader);
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, // Assuming ACCESS_TOKEN_SECRET is a string
    (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).json({ message: "Forbidden" });
        }
        console.log("Decoded JWT Payload:", decoded);
        req.user = decoded.UserInfo.username;
        req.roles = decoded.UserInfo.roles;
        next();
    });
};
exports.default = verifyJWT;
