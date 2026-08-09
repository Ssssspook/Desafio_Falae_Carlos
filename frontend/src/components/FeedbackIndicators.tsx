import type { FeedbackIndicators as FeedbackIndicatorsType } from "../types/feedback";

type Props = {
  indicators: FeedbackIndicatorsType | null;
  isLoading: boolean;
};

export function FeedbackIndicators({ indicators, isLoading }: Props) {
  if (isLoading || !indicators) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total", value: indicators.total },
    { label: "Nota média", value: indicators.notaMedia.toFixed(1) },
    { label: "Positivos", value: indicators.positivos, color: "text-green-600" },
    { label: "Críticos", value: indicators.criticos, color: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold ${card.color ?? "text-gray-900"}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}