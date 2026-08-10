import { useState } from "react";
import type { Feedback, FeedbackFilters as FeedbackFiltersType } from "../types/feedback";
import { useFeedbacks } from "../hooks/useFeedbacks";
import { FeedbackIndicators } from "../components/FeedbackIndicators";
import { FeedbackFilters } from "../components/FeedbackFilters";
import { FeedbackList } from "../components/FeedbackList";
import { FeedbackDetail } from "../components/FeedbackDetail";

export function FeedbacksPage() {
  const [filters, setFilters] = useState<FeedbackFiltersType>({});
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const { feedbacks, indicators, isLoading, error, refetch } = useFeedbacks(filters);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sistema Feedbacks</h1>

      <FeedbackIndicators indicators={indicators} isLoading={isLoading} />
      <FeedbackFilters filters={filters} onChange={setFilters} />
      <FeedbackList
        feedbacks={feedbacks}
        isLoading={isLoading}
        error={error}
        onSelect={setSelectedFeedback}
      />

      {selectedFeedback && (
        <FeedbackDetail
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}