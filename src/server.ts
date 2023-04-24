import express, { NextFunction, Request, Response } from "express";
import { addJobToQueue } from "./worker";

const app = express();

app.post(
  "/hello-world",
  async (req: Request, res: Response, next: NextFunction) => {
    await addJobToQueue({ type: "hello-world", data: req.body });
    res.status(200).json({ message: "Job added to queue" });
  }
);

app.post(
  "/call-api",
  async (req: Request, res: Response, next: NextFunction) => {
    await addJobToQueue({ type: "call-api", data: req.body });
    res.status(200).json({ message: "sample api Job added to queue" });
  }
);

app.listen(3000, () => {
  console.log("Server started 🍦 on port 3000 🚀");
});
