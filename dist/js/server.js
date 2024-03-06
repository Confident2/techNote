"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const path_1 = __importDefault(require("path"));
const roots_1 = __importDefault(require("./routes/roots"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logEvents_1 = require("./middleware/logEvents");
const corsOption_1 = __importDefault(require("./config/corsOption"));
const mongoose_1 = __importDefault(require("mongoose"));
const dbConn_1 = __importDefault(require("./config/dbConn"));
const dbConnection = mongoose_1.default.connection;
(0, dbConn_1.default)();
const PORT = process.env.PORT || 3500;
console.log(process.env.NODE_ENV);
// custom middleware logger
app.use(logEvents_1.logger);
// Cross-Origin Resource Sharing
app.use((0, cors_1.default)(corsOption_1.default));
// built in middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// serve static files
app.use("/", express_1.default.static(path_1.default.join(__dirname, "/public")));
// app.use(express.static(path.join("/public"));
app.use("/", express_1.default.static(path_1.default.join(__dirname, "/src")));
app.use("/", roots_1.default);
app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path_1.default.join(__dirname, "src", "404.html"));
    }
    else if (req.accepts("json")) {
        res.json({ error: "404 Not Found" });
    }
    else {
        res.type("txt").send("404 Not Found");
    }
});
// custom middlware
app.use(errorHandler_1.default);
dbConnection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
});
dbConnection.on("error", (err) => {
    console.log(err);
    (0, logEvents_1.logEvents)(`${err.no}\t${err.code}\t${err.syscall}\t${err.hostname}`, "mongoErrorLog.log");
});
// 0LA3WlRsHdwj2bJr
// technote123
