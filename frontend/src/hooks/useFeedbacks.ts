import { useState, useEffect, useCallback } from "react";
import type { Feedback, FeedbackIndicators, FeedbackFilters } from "../types/feedback";
import { fetchFeedbacks, fetchIndicators } from "../api/feedbacksApi";

type UseFeedbacksResult = {
  feedbacks: Feedback[];
  indicators: FeedbackIndicators | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useFeedbacks(filters: FeedbackFilters): UseFeedbacksResult {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [indicators, setIndicators] = useState<FeedbackIndicators | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [feedbacksData, indicatorsData] = await Promise.all([
          fetchFeedbacks(filters),
          fetchIndicators(filters),
        ]);

        if (!isCancelled) {
          setFeedbacks(feedbacksData);
          setIndicators(indicatorsData);
        }
      } catch {
        if (!isCancelled) {
          setError("Não foi possível carregar os feedbacks. Tente novamente.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [filters.search, filters.channel, filters.status, filters.rating, reloadToken]);

  return { feedbacks, indicators, isLoading, error, refetch };
}