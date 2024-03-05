"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
const roots_1 = __importDefault(require("./routes/roots"));
const PORT = process.env.PORT || 3500;
// serve static files
app.use("/", express_1.default.static(path_1.default.join(__dirname, "/public")));
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
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
