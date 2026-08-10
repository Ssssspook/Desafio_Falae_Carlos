import { useState, useEffect } from "react";
import type { Feedback, FeedbackNote, FeedbackStatus } from "../types/feedback";
import { fetchFeedbackNotes, createFeedbackNote, updateFeedbackStatus } from "../api/feedbacksApi";
import { FeedbackNotes } from "./FeedbackNotes";

type Props = {
  feedback: Feedback;
  onClose: () => void;
  onUpdated: () => void;
};

const STATUS_OPTIONS: FeedbackStatus[] = ["NOVO", "EM_ANALISE", "CONCLUIDO"];

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  CONCLUIDO: "Concluído",
};

export function FeedbackDetail({ feedback, onClose, onUpdated }: Props) {
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(feedback.status);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadNotes() {
      setIsLoadingNotes(true);
      try {
        const data = await fetchFeedbackNotes(feedback.id);
        if (!isCancelled) setNotes(data);
      } finally {
        if (!isCancelled) setIsLoadingNotes(false);
      }
    }

    loadNotes();

    return () => {
      isCancelled = true;
    };
  }, [feedback.id]);

  async function handleAddNote(description: string) {
    const newNote = await createFeedbackNote(feedback.id, description);
    setNotes((prev) => [newNote, ...prev]);
  }

  async function handleStatusChange(newStatus: FeedbackStatus) {
    setIsChangingStatus(true);
    setStatusError(null);

    try {
      await updateFeedbackStatus(feedback.id, newStatus);
      setCurrentStatus(newStatus);
      onUpdated();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Erro ao atualizar status.");
    } finally {
      setIsChangingStatus(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-gray-800">{feedback.customerName}</h2>
            <p className="text-yellow-500">{"★".repeat(feedback.rating)}</p>
</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        {feedback.comment && (
          <p className="text-gray-700 mb-4 text-sm">{feedback.comment}</p>
        )}

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as FeedbackStatus)}
            disabled={isChangingStatus}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {statusError && (
            <p className="text-sm text-red-600 mt-1">{statusError}</p>
          )}
        </div>

        <FeedbackNotes notes={notes} isLoading={isLoadingNotes} onAddNote={handleAddNote} />
      </div>
    </div>
  );
}