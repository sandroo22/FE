import { useState, useEffect } from "react";
import { FaInfoCircle, FaUser } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// IMPORTIAMO IL COMPONENTE DEI TAG
import { MovieTags } from "./MovieTags";

export function MovieDetailsModal({
  token,
  filmSelezionato,
  isDettaglioOpen,
  onClose,
}) {
  const [attori, setAttori] = useState([]);

  // Scarica gli attori quando apri la modale
  useEffect(() => {
    if (filmSelezionato && isDettaglioOpen) {
      fetch(`http://localhost:5000/api/film/${filmSelezionato.id}/attori`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((dati) => setAttori(dati))
        .catch(console.error);
    }
  }, [filmSelezionato, isDettaglioOpen, token]);

  return (
    <Dialog
      open={isDettaglioOpen}
      onOpenChange={(open) => {
        if (!open) {
          setAttori([]); // Svuotiamo la lista quando si chiude
        }
        onClose(open);
      }}
    >
      <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" /> Dettagli Film
          </DialogTitle>
        </DialogHeader>

        {filmSelezionato && (
          <div className="mt-2 sm:mt-4 space-y-4 sm:space-y-6">
            
            {/* AREA INFO FILM */}
            <div className="flex gap-3 sm:gap-4 items-start bg-muted/30 p-2 sm:p-3 rounded-md border">
              {filmSelezionato.copertina ? (
                <img
                  src={filmSelezionato.copertina}
                  alt="Copertina"
                  className="h-20 sm:h-24 w-14 sm:w-16 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="h-20 sm:h-24 w-14 sm:w-16 bg-muted flex items-center justify-center rounded border">
                  <span className="text-[10px] sm:text-xs text-muted-foreground text-center px-1">
                    Nessuna foto
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  {filmSelezionato.testo}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Stato: {filmSelezionato.visto ? " Già visto" : " Da vedere"}
                </p>
              </div>
            </div>

            {/* AREA CAST / ATTORI (Solo visualizzazione) */}
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 border-b pb-1 flex items-center gap-2">
                <FaUser className="text-muted-foreground" /> Cast
              </h3>

              {attori.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground italic text-center py-2">
                  Nessun attore disponibile per questo film.
                </p>
              ) : (
                <ul className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-2">
                  {attori.map((attore) => (
                    <li
                      key={attore.id}
                      className="flex flex-col bg-background border p-2 rounded-md text-xs sm:text-sm"
                    >
                      <span className="font-medium">
                        {attore.nome_cognome}
                      </span>
                      {attore.ruolo && (
                        <span className="text-xs text-muted-foreground italic">
                          come {attore.ruolo}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* COMPONENTE DEI TAG DINAMICI */}
            <MovieTags filmId={filmSelezionato.id} token={token} />

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}