import express, { Request, Response } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import rootRouter from "./routes/roots";
import errorHandler from "./middleware/errorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logEvents, logger } from "./middleware/logEvents";
import corsOptions from "./config/corsOption";
import mongoose, { Connection } from "mongoose";
import connectDB from "./config/dbConn";
import userRoutes from "./routes/userRoutes";
import noteRoutes from "./routes/noteRoutes";

const dbConnection: Connection = mongoose.connection;
connectDB();

const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);
// custom middleware logger
app.use(logger);

// Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data: form data
app.use(express.urlencoded({ extended: false }));

// built in middleware
app.use(express.json());

app.use(cookieParser());

// serve static files
app.use("/", express.static(path.join(__dirname, "/public")));
// app.use(express.static(path.join("/public"));

app.use("/", express.static(path.join(__dirname, "/src")));

app.use("/", rootRouter);
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

app.all("*", (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "src", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// custom middlware
app.use(errorHandler);

dbConnection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
});
dbConnection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}\t${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrorLog.log"
  );
});

// 0LA3WlRsHdwj2bJr
// technote123
