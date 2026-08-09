import { useState } from "react";
import type { Feedback, FeedbackFilters as FeedbackFiltersType } from "../types/feedback";
import { useFeedbacks } from "../hooks/useFeedbacks";
import { FeedbackIndicators } from "../components/FeedbackIndicators";
import { FeedbackFilters } from "../components/FeedbackFilters";
import { FeedbackList } from "../components/FeedbackList";

export function FeedbacksPage() {
  const [filters, setFilters] = useState<FeedbackFiltersType>({});
  const { feedbacks, indicators, isLoading, error } = useFeedbacks(filters);

  function handleSelect(feedback: Feedback) {
    console.log("Selecionado:", feedback);
    // TO DO: abrir detalhe
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedbacks</h1>

      <FeedbackIndicators indicators={indicators} isLoading={isLoading} />
      <FeedbackFilters filters={filters} onChange={setFilters} />
      <FeedbackList feedbacks={feedbacks} isLoading={isLoading} error={error} onSelect={handleSelect} />
    </div>
  );
}