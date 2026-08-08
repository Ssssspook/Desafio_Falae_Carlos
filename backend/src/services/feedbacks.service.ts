import { prisma } from "../lib/prisma.js";

export async function listFeedbacks() {
  return prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbackById(id: number) {
  return prisma.feedback.findUnique({
    where: { id },
  });
}

export async function listFeedbackNotes(feedbackId: number) {
  return prisma.feedbackNote.findMany({
    where: { feedbackId },
    orderBy: { createdAt: "desc" },
  });
}