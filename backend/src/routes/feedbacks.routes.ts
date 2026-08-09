import { Router } from "express";
import {
  getFeedbacks,
  getIndicators,
  getFeedback,
  getNotes,
  postNote,
  patchStatus,
} from "../controllers/feedbacks.controller.js";

export const feedbacksRouter = Router();

feedbacksRouter.get("/", getFeedbacks);
feedbacksRouter.get("/indicators", getIndicators);
feedbacksRouter.get("/:id", getFeedback);
feedbacksRouter.get("/:id/notes", getNotes);
feedbacksRouter.post("/:id/notes", postNote);
feedbacksRouter.patch("/:id/status", patchStatus);