"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logEvents_1 = require("./logEvents");
const errorHandler = (err, req, res, next) => {
    (0, logEvents_1.logEvents)(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, "errLog.log");
    console.error(err.stack);
    const status = res.statusCode ? res.statusCode : 500; // server error
    res.status(status);
    res.json({ message: err.message });
};
exports.default = errorHandler;
