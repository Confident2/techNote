import express from "express";
import path from "path";
import { Router } from "express";
import { Request, Response } from "express";

const rootRouter: Router = express.Router();

rootRouter.get("^/$|/index(.html)?", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "src", "index.html"));
});

export default rootRouter;
