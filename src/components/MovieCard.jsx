import { FaCheck, FaTimes, FaInfoCircle, FaEye, FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";

export function MovieCard({ item, idInModifica, testoModificato, setTestoModificato, salvaModifica, setIdInModifica, apriDettagliFilm, toggleVisto, setIdDaEliminare, setIsModalOpen, cambiaVoto }) {
  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
      {item.visto ? (
        <Badge className="absolute top-2 right-2 z-10 bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => toggleVisto(item.id, item.visto)}>
          <FaEye className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Visto</span>
        </Badge>
      ) : (
        <Badge variant="secondary" className="absolute top-2 right-2 z-10 cursor-pointer opacity-80 hover:opacity-100" onClick={() => toggleVisto(item.id, item.visto)}>
          <FaEyeSlash className="mr-1 h-3 w-3" /> <span className="hidden sm:inline">Da vedere</span>
        </Badge>
      )}

      <div className="relative aspect-[2/3] bg-muted/50 border-b">
        {item.copertina ? (
          <img src={item.copertina} alt={item.testo} className={`absolute inset-0 w-full h-full object-cover transition-all ${item.visto ? "grayscale opacity-60" : ""}`} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs text-center p-4">Nessuna copertina</div>
        )}
      </div>
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
        {idInModifica === item.id ? (
          <div className="flex flex-col gap-2 w-full mt-2">
            <Input value={testoModificato} onChange={(e) => setTestoModificato(e.target.value)} className="bg-background text-sm h-8" autoFocus />
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="flex-1 h-8" onClick={() => salvaModifica(item.id)}><FaCheck className="h-3 w-3" /></Button>
              <Button variant="ghost" size="sm" className="flex-1 h-8" onClick={() => setIdInModifica(null)}><FaTimes className="h-3 w-3" /></Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col mb-4">
              <h3 className={`font-semibold text-sm line-clamp-2 mt-2 ${item.visto ? "text-muted-foreground line-through" : ""}`} title={item.testo}>{item.testo}</h3>
              <StarRating filmId={item.id} currentRating={item.rating} onRatingChange={cambiaVoto} />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2 mt-auto">
              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => apriDettagliFilm(item)}><FaInfoCircle className="h-3 w-3" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setIdInModifica(item.id); setTestoModificato(item.testo); }}><FaEdit className="h-3 w-3" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setIdDaEliminare(item.id); setIsModalOpen(true); }}><FaTrash className="h-3 w-3" /></Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}