import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import { promises as fsPromises, existsSync } from "fs";
import { Request, Response, NextFunction } from "express";
import path from "path";

const generatedUuid = uuid();

const logEvents = async (message: string, fileName: string) => {
  const formattedDate = `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}`;
  const logItem = ` ${formattedDate}\t${generatedUuid}\t${message}\n`;

  try {
    if (!existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", fileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

export { logEvents, logger };
