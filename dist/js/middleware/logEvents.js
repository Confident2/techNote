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
exports.logger = exports.logEvents = void 0;
const date_fns_1 = require("date-fns");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const generatedUuid = (0, uuid_1.v4)();
const logEvents = (message, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const formattedDate = `${(0, date_fns_1.format)(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
    const logItem = ` ${formattedDate}\t${generatedUuid}\t${message}\n`;
    try {
        if (!(0, fs_1.existsSync)(path_1.default.join(__dirname, "..", "logs"))) {
            yield fs_1.promises.mkdir(path_1.default.join(__dirname, "..", "logs"));
        }
        yield fs_1.promises.appendFile(path_1.default.join(__dirname, "..", "logs", fileName), logItem);
    }
    catch (error) {
        console.log(error);
    }
});
exports.logEvents = logEvents;
const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
    console.log(`${req.method} ${req.path}`);
    next();
};
exports.logger = logger;
