import "dotenv/config";
import express from "express";
import cors from "cors";
import { feedbacksRouter } from "./routes/feedbacks.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/feedbacks", feedbacksRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? err.message : "Erro interno do servidor.";
  res.status(statusCode).json({ error: message });
});