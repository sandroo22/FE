import { useState } from "react";
import { FaPlus, FaSearch, FaMagic, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddMovieModal({ token, onFilmAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [moviePreview, setMoviePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Chiave Api OMDb
  const API_KEY = "6b79143";

  const searchMovie = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setError(null);
    setMoviePreview(null);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(searchQuery)}&apikey=${API_KEY}`,
      );
      const data = await response.json();

      if (data.Response === "False") {
        setError("Nessun film trovato con questo titolo. Riprova!");
      } else {
        setMoviePreview({
          title: data.Title,
          poster: data.Poster !== "N/A" ? data.Poster : "",
          actors: data.Actors !== "N/A" ? data.Actors.split(", ") : [],
        });
      }
    } catch (err) {
      console.error(err);
      setError("Errore di connessione al server dei film.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveToMyList = async () => {
    if (!moviePreview) return;
    setIsSaving(true);

    try {
      const filmRes = await fetch("http://localhost:5000/api/film", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testo: moviePreview.title,
          copertina: moviePreview.poster,
        }),
      });

      if (!filmRes.ok) throw new Error("Errore nel salvataggio del film");
      const listaAggiornata = await filmRes.json();

      const nuovoFilm = listaAggiornata.sort((a, b) => b.id - a.id)[0];

      if (moviePreview.actors.length > 0 && nuovoFilm) {
        for (const attore of moviePreview.actors) {
          await fetch(`http://localhost:5000/api/film/${nuovoFilm.id}/attori`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nome_cognome: attore, ruolo: "Attore" }),
          });
        }
      }

      onFilmAdded(listaAggiornata);
      setIsOpen(false);
      resetModal();
    } catch (err) {
      console.error(err);
      setError("C'è stato un problema durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetModal = () => {
    setSearchQuery("");
    setMoviePreview(null);
    setError(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
        if (!val) resetModal();
      }}
    >
      {/* Ho rimosso <Button> e <DialogTrigger asChild>. 
          Ora DialogTrigger è l'unico bottone sano e pulito. */}
      <DialogTrigger className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors">
        <FaPlus className="mr-2 h-4 w-4" /> Aggiungi Film
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FaMagic className="text-primary" /> Ricerca Intelligente
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Cerca un film e lo importeremo automaticamente con locandina e
            attori.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={searchMovie} className="flex space-x-2 mt-4">
          <Input
            placeholder="es. Interstellar, Matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-zinc-900 border-white/20 focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={isSearching || !searchQuery}
            className="bg-white text-black hover:bg-zinc-200"
          >
            {isSearching ? (
              "Cerco..."
            ) : (
              <>
                <FaSearch className="mr-2 h-4 w-4" /> Cerca
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="text-red-500 text-sm mt-2 font-medium">{error}</div>
        )}

        {moviePreview && (
          <div className="mt-6 p-4 border border-white/10 rounded-lg bg-zinc-900/50 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            {moviePreview.poster ? (
              <img
                src={moviePreview.poster}
                alt={moviePreview.title}
                className="h-48 w-32 object-cover rounded-md shadow-lg border border-white/10 mb-4"
                // Se il link di OMDb è rotto (Errore 404), mostriamo un'immagine alternativa!
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/300x450?text=Nessuna+Immagine";
                }}
              />
            ) : (
              <div className="h-48 w-32 bg-zinc-800 rounded-md flex items-center justify-center mb-4 text-xs text-zinc-500">
                Nessuna Immagine
              </div>
            )}
            <h3 className="font-bold text-lg mb-1">{moviePreview.title}</h3>
            <p className="text-xs text-zinc-400 mb-4 max-w-[250px] line-clamp-2">
              <span className="font-semibold text-zinc-300">Cast:</span>{" "}
              {moviePreview.actors.join(", ")}
            </p>

            <div className="flex w-full gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={resetModal}
              >
                <FaTimes className="mr-2 h-3 w-3" /> Annulla
              </Button>
              <Button
                className="flex-1 bg-primary text-white hover:bg-primary/90"
                onClick={handleSaveToMyList}
                disabled={isSaving}
              >
                {isSaving ? "Salvataggio..." : "Salva nella mia lista"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
