import { Router } from "express";
import { getFeedbacks, getFeedback, getNotes } from "../controllers/feedbacks.controller.js";

export const feedbacksRouter = Router();

feedbacksRouter.get("/", getFeedbacks);
feedbacksRouter.get("/:id", getFeedback);
feedbacksRouter.get("/:id/notes", getNotes);