import type { Request, Response } from "express";
import { listFeedbacks, getFeedbackById, listFeedbackNotes } from "../services/feedbacks.service.js";

export async function getFeedbacks(req: Request, res: Response) {
  const feedbacks = await listFeedbacks();
  res.json(feedbacks);
}

export async function getFeedback(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const feedback = await getFeedbackById(id);

  if (!feedback) {
    return res.status(404).json({ error: "Feedback não encontrado." });
  }

  res.json(feedback);
}

export async function getNotes(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const notes = await listFeedbackNotes(id);
  res.json(notes);
}