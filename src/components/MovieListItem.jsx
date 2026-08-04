import {
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "./StarRating";

export function MovieListItem({
  item,
  idInModifica,
  testoModificato,
  setTestoModificato,
  listaModificata,
  setListaModificata,
  liste,
  salvaModifica,
  setIdInModifica,
  apriDettagliFilm,
  toggleVisto,
  setIdDaEliminare,
  setIsModalOpen,
  cambiaVoto,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors">
      {idInModifica === item.id ? (
        <div className="flex flex-col sm:flex-row w-full items-center gap-3">
          <Input
            value={testoModificato}
            onChange={(e) => setTestoModificato(e.target.value)}
            className="flex-1 bg-background"
            autoFocus
          />

          {/* MENU A TENDINA PER CAMBIARE CARTELLA */}
          <select
            value={listaModificata || ""}
            onChange={(e) => setListaModificata(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {liste.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => salvaModifica(item.id)}
            >
              <FaCheck className="mr-2 h-4 w-4" /> Salva
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setIdInModifica(null)}
            >
              <FaTimes className="mr-2 h-4 w-4" /> Annulla
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            {item.copertina && (
              <img
                src={item.copertina}
                alt={item.testo}
                className="h-12 w-8 object-cover rounded-sm shadow-sm"
              />
            )}
            <div className="flex flex-col">
              <div
                className={`font-medium transition-all line-clamp-2 ${item.visto ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {item.testo}
              </div>
              <StarRating
                filmId={item.id}
                currentRating={item.rating}
                onRatingChange={cambiaVoto}
              />
            </div>
          </div>
          <div className="flex items-center justify-end sm:justify-start gap-2 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => apriDettagliFilm(item)}
            >
              <FaInfoCircle className="sm:mr-0 h-4 w-4" />
            </Button>
            <Button
              variant={item.visto ? "default" : "outline"}
              size="sm"
              className={`flex-1 sm:flex-none ${item.visto ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={() => toggleVisto(item.id, item.visto)}
            >
              {item.visto ? (
                <FaEye className="h-4 w-4 text-white" />
              ) : (
                <FaEyeSlash className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>

            {/* AL CLICK MODIFICA, INPOSTIAMO SIA IL TITOLO CHE LA SUA CARTELLA ATTUALE */}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setIdInModifica(item.id);
                setTestoModificato(item.testo);
                setListaModificata(item.lista_id);
              }}
            >
              <FaEdit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setIdDaEliminare(item.id);
                setIsModalOpen(true);
              }}
            >
              <FaTrash className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
