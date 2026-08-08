import "dotenv/config";
import express from "express";
import cors from "cors";
import { feedbacksRouter } from "./routes/feedbacks.routes.js";

const app = express();
const PORT = process.env["PORT"] || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/feedbacks", feedbacksRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});