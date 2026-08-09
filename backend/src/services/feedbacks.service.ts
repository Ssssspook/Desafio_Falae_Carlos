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

export class FeedbackNotFoundError extends Error {
  constructor() {
    super("Feedback não encontrado.");
  }
}

export class InvalidStatusError extends Error {
  constructor() {
    super("Status inválido.");
  }
}

export class CriticalFeedbackWithoutNoteError extends Error {
  constructor() {
    super("Feedbacks críticos (nota 1 ou 2) só podem ser concluídos após receber ao menos uma anotação.");
  }
}

export class EmptyNoteError extends Error {
  constructor() {
    super("A descrição da anotação não pode estar vazia.");
  }
}

const VALID_STATUSES_LIST = ["NOVO", "EM_ANALISE", "CONCLUIDO"] as const;

export async function createFeedbackNote(feedbackId: number, description: string) {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    throw new EmptyNoteError();
  }

  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });

  if (!feedback) {
    throw new FeedbackNotFoundError();
  }

  return prisma.feedbackNote.create({
    data: {
      feedbackId,
      description: trimmed,
    },
  });
}

export async function updateFeedbackStatus(feedbackId: number, newStatus: string) {
  if (!VALID_STATUSES_LIST.includes(newStatus as (typeof VALID_STATUSES_LIST)[number])) {
    throw new InvalidStatusError();
  }

  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: { notes: true },
  });

  if (!feedback) {
    throw new FeedbackNotFoundError();
  }

  const isCritical = feedback.rating <= 2;
  const wantsToConclude = newStatus === "CONCLUIDO";
  const hasNoNotes = feedback.notes.length === 0;

  if (isCritical && wantsToConclude && hasNoNotes) {
    throw new CriticalFeedbackWithoutNoteError();
  }

  return prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: newStatus as (typeof VALID_STATUSES_LIST)[number] },
  });
}