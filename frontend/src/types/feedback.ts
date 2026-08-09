export type FeedbackChannel = "GOOGLE" | "IFOOD" | "PESQUISA";
export type FeedbackStatus = "NOVO" | "EM_ANALISE" | "CONCLUIDO";

export type Feedback = {
  id: number;
  customerName: string;
  rating: number;
  comment: string | null;
  channel: FeedbackChannel;
  status: FeedbackStatus;
  createdAt: string;
};

export type FeedbackNote = {
  id: number;
  feedbackId: number;
  description: string;
  createdAt: string;
};

export type FeedbackIndicators = {
  total: number;
  notaMedia: number;
  positivos: number;
  criticos: number;
};

export type FeedbackFilters = {
  search?: string;
  channel?: FeedbackChannel;
  status?: FeedbackStatus;
  rating?: number;
};