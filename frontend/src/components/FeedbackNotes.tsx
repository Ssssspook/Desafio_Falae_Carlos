import { useState } from "react";
import type { FeedbackNote } from "../types/feedback";

type Props = {
  notes: FeedbackNote[];
  isLoading: boolean;
  onAddNote: (description: string) => Promise<void>;
};

export function FeedbackNotes({ notes, isLoading, onAddNote }: Props) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!description.trim()) {
      setError("A anotação não pode estar vazia.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddNote(description);
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar anotação.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Anotações</h3>

      {isLoading ? (
        <div className="space-y-2 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">Nenhuma anotação registrada ainda.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {notes.map((note) => (
            <li key={note.id} className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm">
              <p className="text-gray-800">{note.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(note.createdAt).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicionar nova anotação..."
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Adicionar anotação"}
        </button>
      </form>
    </div>
  );
}