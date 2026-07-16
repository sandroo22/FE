import { useState, useEffect } from "react";
import { FaInfoCircle, FaUser, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MovieDetailsModal({
  token,
  filmSelezionato,
  isDettaglioOpen,
  onClose,
}) {
  const [attori, setAttori] = useState([]);
  const [nuovoAttore, setNuovoAttore] = useState("");
  const [attoreError, setAttoreError] = useState("");

  // 1. RIMOSSO L'AZZERAMENTO DA QUI: L'effetto ora fa solo la chiamata al server
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

  const aggiungiAttore = (e) => {
    e.preventDefault();
    setAttoreError("");

    if (!nuovoAttore.trim()) {
      setAttoreError("Inserisci il nome e cognome dell'attore.");
      return;
    }

    fetch(`http://localhost:5000/api/film/${filmSelezionato.id}/attori`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome_cognome: nuovoAttore }),
    })
      .then((res) => res.json())
      .then((listaAggiornata) => {
        setAttori(listaAggiornata);
        setNuovoAttore("");
      })
      .catch(console.error);
  };

  const eliminaAttore = (attoreId) => {
    fetch(`http://localhost:5000/api/attori/${attoreId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setAttori(attori.filter((a) => a.id !== attoreId));
      })
      .catch(console.error);
  };

  return (
    <Dialog
      open={isDettaglioOpen}
      onOpenChange={(open) => {
        // 2. AGGIUNTO QUI: Puliamo gli stati nel momento esatto in cui la modale si chiude
        if (!open) {
          setAttori([]);
          setNuovoAttore("");
          setAttoreError("");
        }
        onClose(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" /> Dettagli Film
          </DialogTitle>
        </DialogHeader>

        {filmSelezionato && (
          <div className="mt-2 sm:mt-4 space-y-4 sm:space-y-6">
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
                  Stato:{" "}
                  {filmSelezionato.visto ? "Già visto" : "Da vedere"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 border-b pb-1 flex items-center gap-2">
                <FaUser className="text-muted-foreground" /> Attori
              </h3>

              {attori.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground italic text-center py-2">
                  Nessun attore inserito per questo film.
                </p>
              ) : (
                <ul className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-2">
                  {attori.map((attore) => (
                    <li
                      key={attore.id}
                      className="flex justify-between items-center bg-background border p-2 rounded-md text-xs sm:text-sm"
                    >
                      <span>{attore.nome_cognome}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => eliminaAttore(attore.id)}
                        title="Rimuovi attore"
                      >
                        <FaTimes className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={aggiungiAttore}
              className="flex flex-col gap-2 pt-2 border-t"
              noValidate
            >
              <p className="text-xs sm:text-sm font-medium">
                Aggiungi un attore:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome e cognome (es. DiCaprio)"
                  value={nuovoAttore}
                  onChange={(e) => {
                    setNuovoAttore(e.target.value);
                    setAttoreError("");
                  }}
                  className={`flex-1 text-sm ${attoreError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <Button type="submit" size="sm">
                  Aggiungi
                </Button>
              </div>
              {attoreError && (
                <span className="text-[10px] sm:text-xs font-semibold text-destructive">
                  {attoreError}
                </span>
              )}
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
