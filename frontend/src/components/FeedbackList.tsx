import type { Feedback } from "../types/feedback";

type Props = {
  feedbacks: Feedback[];
  isLoading: boolean;
  error: string | null;
  onSelect: (feedback: Feedback) => void;
};

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  CONCLUIDO: "Concluído",
};

const STATUS_COLORS: Record<string, string> = {
  NOVO: "bg-blue-100 text-blue-700",
  EM_ANALISE: "bg-yellow-100 text-yellow-700",
  CONCLUIDO: "bg-green-100 text-green-700",
};

export function FeedbackList({ feedbacks, isLoading, error, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        {error}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 text-sm">
        Nenhum feedback encontrado com os filtros aplicados.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {feedbacks.map((feedback) => (
        <button
          key={feedback.id}
          onClick={() => onSelect(feedback)}
          className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{feedback.customerName}</span>
                <span className="text-yellow-500 text-sm">{"★".repeat(feedback.rating)}</span>
              </div>
              {feedback.comment && (
                <p className="text-sm text-gray-500 truncate">{feedback.comment}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[feedback.status]}`}>
              {STATUS_LABELS[feedback.status]}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}