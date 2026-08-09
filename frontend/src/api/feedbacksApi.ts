import type { Feedback, FeedbackNote, FeedbackIndicators, FeedbackFilters } from "../types/feedback";

const BASE_URL = "http://localhost:3000/api/feedbacks";

function buildQueryString(filters: FeedbackFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.channel) params.set("channel", filters.channel);
  if (filters.status) params.set("status", filters.status);
  if (filters.rating) params.set("rating", String(filters.rating));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchFeedbacks(filters: FeedbackFilters = {}): Promise<Feedback[]> {
  const response = await fetch(`${BASE_URL}${buildQueryString(filters)}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar feedbacks.");
  }

  return response.json();
}

export async function fetchIndicators(filters: FeedbackFilters = {}): Promise<FeedbackIndicators> {
  const response = await fetch(`${BASE_URL}/indicators${buildQueryString(filters)}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar indicadores.");
  }

  return response.json();
}

export async function fetchFeedbackById(id: number): Promise<Feedback> {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar feedback.");
  }

  return response.json();
}

export async function fetchFeedbackNotes(id: number): Promise<FeedbackNote[]> {
  const response = await fetch(`${BASE_URL}/${id}/notes`);

  if (!response.ok) {
    throw new Error("Erro ao buscar anotações.");
  }

  return response.json();
}

export async function createFeedbackNote(id: number, description: string): Promise<FeedbackNote> {
  const response = await fetch(`${BASE_URL}/${id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao criar anotação.");
  }

  return response.json();
}

export async function updateFeedbackStatus(id: number, status: string): Promise<Feedback> {
  const response = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao atualizar status.");
  }

  return response.json();
}