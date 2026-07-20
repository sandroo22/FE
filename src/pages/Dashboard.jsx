import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaList,
  FaThLarge,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaSearch // NUOVA ICONA PER LA RICERCA
} from "react-icons/fa";
import { Navbar } from "@/components/Navbar";
import { AddMovieModal } from "@/components/AddMovieModal";
import { MovieDetailsModal } from "@/components/MovieDetailsModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function Dashboard({ token, onLogout }) {
  const [film, setFilm] = useState([]);
  
  const [idInModifica, setIdInModifica] = useState(null);
  const [testoModificato, setTestoModificato] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idDaEliminare, setIdDaEliminare] = useState(null);
  
  const [viewMode, setViewMode] = useState("list");

  const [isDettaglioOpen, setIsDettaglioOpen] = useState(false);
  const [filmSelezionato, setFilmSelezionato] = useState(null); 

  // NUOVO STATO: Salva il testo digitato nella barra di ricerca
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/film", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Errore di autorizzazione o server");
          return res.json();
        })
        .then((dati) => {
          if (Array.isArray(dati)) setFilm(dati);
          else setFilm([]);
        })
        .catch((err) => {
          console.error("Errore nel caricamento:", err);
          setFilm([]);
        });
    }
  }, [token]);

  const salvaModifica = (id) => {
    fetch(`http://localhost:5000/api/film/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ testo: testoModificato }),
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
        setIdInModifica(null);
      })
      .catch(console.error);
  };

  const toggleVisto = (id, statoAttuale) => {
    const nuovoStato = !statoAttuale;
    fetch(`http://localhost:5000/api/film/${id}/visto`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ visto: nuovoStato }),
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
      })
      .catch(console.error);
  };

  const handleConfermaElimina = () => {
    fetch(`http://localhost:5000/api/film/${idDaEliminare}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
        setIsModalOpen(false);
      })
      .catch(console.error);
  };

  const apriDettagliFilm = (filmCliccato) => {
    setFilmSelezionato(filmCliccato);
    setIsDettaglioOpen(true);
  };

  // LOGICA DI FILTRAGGIO: 
  // 1. Assicuriamoci che la lista sia un array
  const filmList = Array.isArray(film) ? film : [];
  // 2. Creiamo una nuova lista filtrata in base a ciò che l'utente digita (ignorando maiuscole e minuscole)
  const filteredFilms = filmList.filter((item) => 
    item.testo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Navbar onLogout={onLogout} />

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">I tuoi Film</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Gestisci e organizza la tua lista in modo semplice.
              </p>
            </div>
            <AddMovieModal token={token} onFilmAdded={setFilm} />
          </div>

          {/* BARRA DI RICERCA + TABS (Lista/Griglia) */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            
            {/* Input di Ricerca */}
            <div className="relative w-full sm:w-[300px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Cerca un film..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background border-muted-foreground/30 focus-visible:ring-primary"
              />
            </div>

            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full sm:w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list"><FaList className="h-4 w-4 mr-2" /> Lista</TabsTrigger>
                <TabsTrigger value="grid"><FaThLarge className="h-4 w-4 mr-2" /> Griglia</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* CONTROLLO COSA MOSTRARE: Nessun film, Nessun risultato di ricerca, oppure i Film! */}
          {filmList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border bg-background rounded-md shadow-sm">
              Nessun elemento presente. Clicca su "Aggiungi Film" per iniziare!
            </div>
          ) : filteredFilms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border bg-background rounded-md shadow-sm">
              Nessun film trovato per "<strong>{searchQuery}</strong>".
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-md border bg-background shadow-sm">
              <div className="divide-y divide-border">
                {/* ORA MAPPPIAMO 'filteredFilms' E NON 'filmList' */}
                {filteredFilms.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors">
                    {idInModifica === item.id ? (
                      <div className="flex flex-col sm:flex-row w-full items-center gap-3">
                        <Input value={testoModificato} onChange={(e) => setTestoModificato(e.target.value)} className="flex-1 bg-background" autoFocus />
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="default" size="sm" className="flex-1" onClick={() => salvaModifica(item.id)}>
                            <FaCheck className="mr-2 h-4 w-4" /> Salva
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setIdInModifica(null)}>
                            <FaTimes className="mr-2 h-4 w-4" /> Annulla
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          {item.copertina && (
                            <img src={item.copertina} alt={item.testo} className="h-12 w-8 object-cover rounded-sm shadow-sm" />
                          )}
                          <div className={`font-medium transition-all line-clamp-2 ${item.visto ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {item.testo}
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-2 self-end sm:self-auto w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0">
                          
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => apriDettagliFilm(item)} title="Dettagli e Attori">
                            <FaInfoCircle className="sm:mr-0 h-4 w-4" />
                          </Button>

                          <Button
                            variant={item.visto ? "default" : "outline"}
                            size="sm"
                            className={`flex-1 sm:flex-none ${item.visto ? "bg-green-600 hover:bg-green-700" : ""}`}
                            onClick={() => toggleVisto(item.id, item.visto)}
                            title={item.visto ? "Segna come da guardare" : "Segna come visto"}
                          >
                            {item.visto ? <FaEye className="h-4 w-4 text-white" /> : <FaEyeSlash className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => { setIdInModifica(item.id); setTestoModificato(item.testo); }}>
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setIdDaEliminare(item.id); setIsModalOpen(true); }}>
                            <FaTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* ANCHE QUI MAPPPIAMO 'filteredFilms' */}
              {filteredFilms.map((item) => (
                <Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                  
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
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                        Nessuna copertina
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    {idInModifica === item.id ? (
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <Input value={testoModificato} onChange={(e) => setTestoModificato(e.target.value)} className="bg-background text-sm h-8" autoFocus />
                        <div className="flex gap-2">
                          <Button variant="default" size="sm" className="flex-1 h-8" onClick={() => salvaModifica(item.id)}>
                            <FaCheck className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="flex-1 h-8" onClick={() => setIdInModifica(null)}>
                            <FaTimes className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className={`font-semibold text-sm line-clamp-2 mt-2 ${item.visto ? "text-muted-foreground line-through" : ""}`} title={item.testo}>
                          {item.testo}
                        </h3>
                        <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2 mt-4">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => apriDettagliFilm(item)}>
                            <FaInfoCircle className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setIdInModifica(item.id); setTestoModificato(item.testo); }}>
                            <FaEdit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setIdDaEliminare(item.id); setIsModalOpen(true); }}>
                            <FaTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Questo eliminerà definitivamente il film e i relativi attori dal nostro database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfermaElimina} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MovieDetailsModal 
        token={token} 
        filmSelezionato={filmSelezionato} 
        isDettaglioOpen={isDettaglioOpen} 
        onClose={setIsDettaglioOpen} 
      />
      
    </div>
  );
}