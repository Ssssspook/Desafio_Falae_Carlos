import type { FeedbackFilters as FeedbackFiltersType, FeedbackChannel, FeedbackStatus } from "../types/feedback";

type Props = {
  filters: FeedbackFiltersType;
  onChange: (filters: FeedbackFiltersType) => void;
};

const CHANNELS: FeedbackChannel[] = ["GOOGLE", "IFOOD", "PESQUISA"];
const STATUSES: FeedbackStatus[] = ["NOVO", "EM_ANALISE", "CONCLUIDO"];

export function FeedbackFilters({ filters, onChange }: Props) {
  const hasActiveFilters = Boolean(
    filters.search || filters.channel || filters.status || filters.rating
  );

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Buscar por cliente ou comentário..."
        value={filters.search ?? ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm"
      />

      <select
        value={filters.channel ?? ""}
        onChange={(e) =>
          onChange({ ...filters, channel: (e.target.value || undefined) as FeedbackChannel | undefined })
        }
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Todos os canais</option>
        {CHANNELS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.status ?? ""}
        onChange={(e) =>
          onChange({ ...filters, status: (e.target.value || undefined) as FeedbackStatus | undefined })
        }
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Todos os status</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={filters.rating ?? ""}
        onChange={(e) =>
          onChange({ ...filters, rating: e.target.value ? Number(e.target.value) : undefined })
        }
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Todas as notas</option>
        {[1, 2, 3, 4, 5].map((r) => (
          <option key={r} value={r}>{r} estrela{r > 1 ? "s" : ""}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({})}
          className="text-sm text-gray-500 hover:text-gray-700 underline px-2"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}