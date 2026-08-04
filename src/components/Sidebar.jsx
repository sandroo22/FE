import { useState, useRef } from "react";
import { FaFolder, FaFolderOpen, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaDownload, FaUpload } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Sidebar({
  liste, selectedListaId, setSelectedListaId, nuovaListaNome, setNuovaListaNome,
  creaNuovaLista, listaInModifica, setListaInModifica, testoModificaLista,
  setTestoModificaLista, salvaModificaLista, eliminaLista, esportaJSON, importaJSON
}) {
  const [listaDaEliminare, setListaDaEliminare] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // --- NUOVO: Creiamo un riferimento per collegare il bottone all'input file ---
  const fileInputRef = useRef(null);

  const apriAlertEliminazione = (e, id) => {
    e.stopPropagation();
    setListaDaEliminare(id);
    setIsAlertOpen(true);
  };

  const confermaEliminazione = () => {
    if (listaDaEliminare) eliminaLista(listaDaEliminare);
    setIsAlertOpen(false);
    setListaDaEliminare(null);
  };

  return (
    <>
      <aside className="w-full md:w-64 lg:w-72 border-b md:border-b-0 md:border-r border-border bg-background p-4 flex flex-col gap-4 shrink-0 overflow-y-auto transform-gpu">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-2">
          <FaFolder className="text-primary" /> Le tue Liste
        </h2>

        <ul className="space-y-1 flex-1">
          {liste.map((lista) => (
            <li key={lista.id}>
              {listaInModifica === lista.id ? (
                <div className="flex gap-1 items-center p-1">
                  <Input value={testoModificaLista} onChange={(e) => setTestoModificaLista(e.target.value)} className="h-7 text-xs flex-1 focus-visible:ring-0 focus-visible:ring-offset-0" autoFocus />
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => salvaModificaLista(lista.id)}><FaCheck className="h-3 w-3" /></Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600" onClick={() => setListaInModifica(null)}><FaTimes className="h-3 w-3" /></Button>
                </div>
              ) : (
                <div onClick={() => setSelectedListaId(lista.id)} className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedListaId === lista.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}>
                  <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    {selectedListaId === lista.id ? <FaFolderOpen /> : <FaFolder />}
                    <span className="truncate text-sm">{lista.nome}</span>
                  </div>
                  {!lista.is_default && selectedListaId === lista.id && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <FaEdit className="h-3 w-3 text-muted-foreground hover:text-blue-500" onClick={(e) => { e.stopPropagation(); setListaInModifica(lista.id); setTestoModificaLista(lista.nome); }} />
                      <FaTrash className="h-3 w-3 text-muted-foreground hover:text-destructive" onClick={(e) => apriAlertEliminazione(e, lista.id)} />
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        <form onSubmit={creaNuovaLista} className="mt-4 pt-4 border-t border-b pb-4 flex gap-2">
          <Input placeholder="Nuova cartella..." value={nuovaListaNome} onChange={(e) => setNuovaListaNome(e.target.value)} className="h-8 text-sm flex-1 focus-visible:ring-0 focus-visible:ring-offset-0" />
          <Button type="submit" size="icon" className="h-8 w-8 shrink-0"><FaPlus className="h-3 w-3" /></Button>
        </form>

        {/* --- TASTI IMPORT / EXPORT AGGIORNATI --- */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <Button variant="outline" className="w-full justify-start text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200" onClick={esportaJSON}>
            <FaDownload className="mr-2 h-3 w-3" /> Esporta Backup JSON
          </Button>
          
          <div className="relative w-full">
            {/* L'input ora è realmente nascosto, niente più blocchi trasparenti! */}
            <input 
              type="file" 
              accept=".json" 
              onChange={importaJSON}
              className="hidden"
              ref={fileInputRef}
            />
            {/* Il bottone ora è un bottone vero: reagisce al click e all'hover */}
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload className="mr-2 h-3 w-3" /> Ripristina da JSON
            </Button>
          </div>
        </div>
      </aside>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>Questa azione eliminerà la cartella. I film verranno spostati in automatico nella cartella <strong>Generale</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confermaEliminazione} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Elimina cartella</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}