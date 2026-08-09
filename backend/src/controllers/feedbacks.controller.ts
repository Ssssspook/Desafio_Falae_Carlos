import type { Request, Response } from "express";
import {
  listFeedbacks,
  getFeedbackIndicators,
  getFeedbackById,
  listFeedbackNotes,
  createFeedbackNote,
  updateFeedbackStatus,
  FeedbackNotFoundError,
  InvalidStatusError,
  CriticalFeedbackWithoutNoteError,
  EmptyNoteError,
} from "../services/feedbacks.service.js";

const VALID_CHANNELS = ["GOOGLE", "IFOOD", "PESQUISA"];
const VALID_STATUSES = ["NOVO", "EM_ANALISE", "CONCLUIDO"];

function extractFilters(req: Request) {
  const channel = req.query["channel"] as string | undefined;
  const status = req.query["status"] as string | undefined;

  return {
    search: req.query["search"] as string | undefined,
    channel: channel && VALID_CHANNELS.includes(channel) ? channel : undefined,
    status: status && VALID_STATUSES.includes(status) ? status : undefined,
    rating: req.query["rating"] as string | undefined,
  };
}

export async function getFeedbacks(req: Request, res: Response) {
  const filters = extractFilters(req);
  const feedbacks = await listFeedbacks(filters);
  res.json(feedbacks);
}

export async function getIndicators(req: Request, res: Response) {
  const filters = extractFilters(req);
  const indicators = await getFeedbackIndicators(filters);
  res.json(indicators);
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

export async function postNote(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const description = req.body?.description;

  if (typeof description !== "string") {
    return res.status(400).json({ error: "Campo 'description' é obrigatório." });
  }

  try {
    const note = await createFeedbackNote(id, description);
    res.status(201).json(note);
  } catch (err) {
    if (err instanceof EmptyNoteError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof FeedbackNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    throw err;
  }
}

export async function patchStatus(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const status = req.body?.status;

  if (typeof status !== "string") {
    return res.status(400).json({ error: "Campo 'status' é obrigatório." });
  }

  try {
    const updated = await updateFeedbackStatus(id, status);
    res.json(updated);
  } catch (err) {
    if (err instanceof InvalidStatusError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof CriticalFeedbackWithoutNoteError) {
      return res.status(422).json({ error: err.message });
    }
    if (err instanceof FeedbackNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    throw err;
  }
}