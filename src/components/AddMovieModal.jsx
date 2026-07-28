import { useState } from "react";
import { FaPlus, FaSearch, FaMagic, FaArrowLeft } from "react-icons/fa";
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

  const [searchResults, setSearchResults] = useState([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [moviePreview, setMoviePreview] = useState(null);

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  //  NUOVA CHIAVE TMDB
  const API_KEY = "f54f39b5310035478bd10b4d1487458b";

  //  RICERCA MULTIPLA CON TMDB (Titoli e locandine in Italiano)
  const searchMovie = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setMoviePreview(null);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&api_key=${API_KEY}&language=it-IT`,
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError("Nessun film trovato con questo titolo. Riprova!");
      } else {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error(err);
      setError("Errore di connessione al server TMDb.");
    } finally {
      setIsSearching(false);
    }
  };

  //  RECUPERO DETTAGLI AVANZATI (Cast e Ruoli!)
  const selectMovie = async (tmdbID) => {
    setIsFetchingDetails(true);
    setError(null);
    try {
      // Usiamo append_to_response per scaricare Film + Attori in un colpo solo
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbID}?append_to_response=credits&api_key=${API_KEY}&language=it-IT`,
      );
      const data = await response.json();

      if (data.id) {
        // Estraiamo solo i primi 8 attori per non intasare il database
        const topCast = data.credits?.cast?.slice(0, 8) || [];

        setMoviePreview({
          title: data.title,
          // TMDb fornisce solo la fine del link dell'immagine, dobbiamo aggiungere la prima parte:
          poster: data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : "",
          // Creiamo un oggetto per ogni attore con Nome e Ruolo!
          actors: topCast.map((actor) => ({
            name: actor.name,
            role: actor.character || "Sconosciuto",
          })),
          year: data.release_date ? data.release_date.substring(0, 4) : "N/D",
        });
      } else {
        setError("Impossibile recuperare i dettagli del film.");
      }
    } catch (err) {
      console.error(err);
      setError("Errore nel recupero dei dettagli.");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // SALVATAGGIO NEL NOSTRO DATABASE (Ora passiamo anche il ruolo!)
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

      if (!filmRes.ok) throw new Error("Errore nel salvataggio");
      const listaAggiornata = await filmRes.json();
      const nuovoFilm = listaAggiornata.sort((a, b) => b.id - a.id)[0];

      if (moviePreview.actors.length > 0 && nuovoFilm) {
        for (const attore of moviePreview.actors) {
          // Guarda qui: ora mandiamo sia "nome_cognome" che "ruolo"!
          await fetch(`http://localhost:5000/api/film/${nuovoFilm.id}/attori`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nome_cognome: attore.name,
              ruolo: attore.role,
            }),
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
    setSearchResults([]);
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
      <DialogTrigger className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors">
        <FaPlus className="mr-2 h-4 w-4" /> Aggiungi Film
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl bg-zinc-950 border-white/10 text-white max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FaMagic className="text-primary" /> Ricerca Intelligente TMDb
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Cerca un film e importalo con i ruoli esatti degli attori.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={searchMovie} className="flex space-x-2 mt-4 shrink-0">
          <Input
            placeholder="es. Spiderman, Batman..."
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
          <div className="text-red-500 text-sm mt-2 font-medium shrink-0">
            {error}
          </div>
        )}
        {isFetchingDetails && (
          <div className="text-primary text-sm mt-4 text-center animate-pulse">
            Recupero cast e dettagli...
          </div>
        )}

        <div className="mt-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {searchResults.length > 0 && !moviePreview && !isFetchingDetails && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors flex flex-col group"
                  onClick={() => selectMovie(movie.id)}
                >
                  <div className="relative aspect-[2/3] bg-zinc-800">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/300x450?text=N/D";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        Nessuna Immagine
                      </div>
                    )}
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <h4
                      className="font-semibold text-sm line-clamp-2"
                      title={movie.title}
                    >
                      {movie.title}
                    </h4>
                    <span className="text-xs text-zinc-400 mt-1">
                      {movie.release_date
                        ? movie.release_date.substring(0, 4)
                        : "N/D"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {moviePreview && (
            <div className="p-4 border border-white/10 rounded-lg bg-zinc-900/50 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              {moviePreview.poster ? (
                <img
                  src={moviePreview.poster}
                  alt={moviePreview.title}
                  className="h-56 w-36 object-cover rounded-md shadow-lg border border-white/10 mb-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x450?text=Nessuna+Immagine";
                  }}
                />
              ) : (
                <div className="h-56 w-36 bg-zinc-800 rounded-md flex items-center justify-center mb-4 text-xs text-zinc-500">
                  Nessuna Immagine
                </div>
              )}
              <h3 className="font-bold text-xl mb-1">
                {moviePreview.title}{" "}
                <span className="text-zinc-400 text-base font-normal">
                  ({moviePreview.year})
                </span>
              </h3>

              <div className="text-sm text-zinc-400 mb-6 max-w-[400px] text-left w-full mt-2 space-y-1 h-32 overflow-y-auto custom-scrollbar">
                <span className="font-semibold text-zinc-300 block mb-2 text-center">
                  Cast Principale:
                </span>
                {moviePreview.actors.map((actor, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border-b border-white/5 pb-1"
                  >
                    <span className="text-zinc-300 font-medium">
                      {actor.name}
                    </span>
                    <span className="text-zinc-500 italic text-xs mt-1">
                      {actor.role}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex w-full gap-2 mt-auto">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => setMoviePreview(null)}
                >
                  <FaArrowLeft className="mr-2 h-3 w-3" /> Indietro
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
