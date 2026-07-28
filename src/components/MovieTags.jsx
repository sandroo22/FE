import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTag, FaTimes } from "react-icons/fa"; // Aggiunto FaTimes
import { Input } from "@/components/ui/input";

export function MovieTags({ filmId, token }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/film/${filmId}/tags`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Errore nel caricamento dei tag:", err);
    }
  }, [filmId, token]);

  useEffect(() => {
    if (filmId && token) {
      const loadTags = async () => {
        await fetchTags();
      };
      loadTags();
    }
  }, [filmId, token, fetchTags]);

  // NUOVA FUNZIONE: ELIMINA TAG
  const handleRemoveTag = async (tagId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/film/${filmId}/tags/${tagId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setTags(tags.filter((tag) => tag.id !== tagId));
      }
    } catch (err) {
      console.error("Errore nella rimozione del tag:", err);
    }
  };

  const handleAddTag = async (e) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      e.preventDefault();
      setIsAdding(true);

      try {
        const response = await fetch(
          `http://localhost:5000/api/film/${filmId}/tags`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nome_tag: newTag.trim().toLowerCase() }),
          },
        );

        if (response.ok) {
          setNewTag("");
          fetchTags();
        }
      } catch (err) {
        console.error("Errore nel salvataggio del tag:", err);
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="mt-6 border-t border-white/10 pt-4 animate-in fade-in duration-300">
      <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-3">
        <FaTag className="text-primary" /> I tuoi Tag
      </h4>

      <div className="flex flex-wrap gap-2 mb-3">
        {tags.length === 0 && (
          <span className="text-xs text-zinc-500 italic">
            Nessun tag assegnato. Creane uno!
          </span>
        )}
        {tags.map((tag) => (
          <span
            key={tag.id}
            // Aggiunto flex, items-center e gap-1 per allineare testo e icona
            className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm border border-white/10 flex items-center gap-1.5 transition-all hover:brightness-110"
            style={{ backgroundColor: tag.colore || "#3b82f6" }}
          >
            #{tag.nome}
            {/* PULSANTE ELIMINA  */}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 opacity-70 hover:opacity-100 hover:scale-110 transition-all focus:outline-none"
              title="Rimuovi tag"
            >
              <FaTimes className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative mt-2">
        <FaPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-3 w-3" />
        <Input
          type="text"
          placeholder="Scrivi un tag e premi Invio..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          disabled={isAdding}
          className="pl-8 bg-zinc-900 border-white/10 text-sm h-9 focus-visible:ring-primary text-white"
        />
      </div>
    </div>
  );
}
