import express, { Request, Response } from "express";
const app = express();
import path from "path";
import rootRouter from "./routes/roots";
const PORT = process.env.PORT || 3500;

// serve static files
app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/", express.static(path.join(__dirname, "/src")));

app.use("/", rootRouter);

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

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
