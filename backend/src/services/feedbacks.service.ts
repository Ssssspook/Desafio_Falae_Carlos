import { prisma } from "../lib/prisma.js";
import type { Prisma, FeedbackChannel, FeedbackStatus } from "../../generated/prisma/client.js";

type FeedbackFilters = {
  search?: string | undefined;
  channel?: string | undefined;
  status?: string | undefined;
  rating?: string | undefined;
};

function buildWhereClause(filters: FeedbackFilters): Prisma.FeedbackWhereInput {
  const where: Prisma.FeedbackWhereInput = {};

  if (filters.channel) {
    where.channel = filters.channel as FeedbackChannel;
  }

  if (filters.status) {
    where.status = filters.status as FeedbackStatus;
  }

  if (filters.rating) {
    where.rating = Number(filters.rating);
  }

  if (filters.search) {
    where.OR = [
      { customerName: { contains: filters.search } },
      { comment: { contains: filters.search } },
    ];
  }

  return where;
}

export async function listFeedbacks(filters: FeedbackFilters) {
  const where = buildWhereClause(filters);

  return prisma.feedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeedbackIndicators(filters: FeedbackFilters) {
  const where = buildWhereClause(filters);

  const feedbacks = await prisma.feedback.findMany({
    where,
    select: { rating: true },
  });

  const total = feedbacks.length;
  const positivos = feedbacks.filter((f) => f.rating >= 4).length;
  const criticos = feedbacks.filter((f) => f.rating <= 2).length;

  const somaNotas = feedbacks.reduce((acc, f) => acc + f.rating, 0);
  const notaMedia = total > 0 ? Math.round((somaNotas / total) * 10) / 10 : 0;

  return { total, notaMedia, positivos, criticos };
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