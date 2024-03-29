import { logEvents } from "./logEvents";
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  console.error(err.stack);
  const status = res.statusCode ? res.statusCode : 500; // server error
  res.status(status);
  res.json({ message: err.message, isError: true });
};

export default errorHandler;
