import { Router } from "express";
import { getFeedbacks, getIndicators, getFeedback, getNotes } from "../controllers/feedbacks.controller.js";

export const feedbacksRouter = Router();

feedbacksRouter.get("/", getFeedbacks);
feedbacksRouter.get("/indicators", getIndicators);
feedbacksRouter.get("/:id", getFeedback);
feedbacksRouter.get("/:id/notes", getNotes);