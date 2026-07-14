import { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaPlus,
  FaList,
  FaThLarge,
} from "react-icons/fa";
import { Navbar } from "@/components/Navbar";

// Componenti shadcn
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard({ token, onLogout }) {
  const [film, setFilm] = useState([]);
  const [nuovoTesto, setNuovoTesto] = useState("");
  // Modificato: non più una stringa di testo, ma uno stato pronto ad accogliere un file
  const [fileCopertina, setFileCopertina] = useState(null);

  const [idInModifica, setIdInModifica] = useState(null);
  const [testoModificato, setTestoModificato] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [idDaEliminare, setIdDaEliminare] = useState(null);
  const [viewMode, setViewMode] = useState("list");

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
          if (Array.isArray(dati)) {
            setFilm(dati);
          } else {
            setFilm([]);
          }
        })
        .catch((err) => {
          console.error("Errore nel caricamento:", err);
          setFilm([]);
        });
    }
  }, [token]);

  const gestisciInvio = (e) => {
    e.preventDefault();
    if (!nuovoTesto.trim()) return;

    // Creiamo un pacchetto speciale (FormData) in grado di trasportare file fisici
    const formData = new FormData();
    formData.append("testo", nuovoTesto);
    if (fileCopertina) {
      formData.append("copertina", fileCopertina);
    }

    fetch("http://localhost:5000/api/film", {
      method: "POST",
      // ATTENZIONE: Quando si usa FormData, NON bisogna mettere il Content-Type.
      // Il browser capisce da solo che è un file e imposta i parametri corretti!
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
        setNuovoTesto("");
        setFileCopertina(null); // Svuota il file dopo il salvataggio
        setIsAddModalOpen(false);
      })
      .catch(console.error);
  };

  const salvaModifica = (id) => {
    fetch(`http://localhost:5000/api/film/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ testo: testoModificato }),
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
        setIdInModifica(null);
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

  const filmList = Array.isArray(film) ? film : [];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Navbar onLogout={onLogout} />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">I tuoi Film</h1>
              <p className="text-muted-foreground mt-1">
                Gestisci e organizza la tua lista in modo semplice.
              </p>
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="shadow-sm">
                  <FaPlus className="mr-2 h-4 w-4" /> Aggiungi Film
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Aggiungi alla lista</DialogTitle>
                  <DialogDescription>
                    Inserisci il titolo e carica una copertina dal tuo computer.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={gestisciInvio}
                  className="flex flex-col gap-4 mt-4"
                >
                  <Input
                    value={nuovoTesto}
                    onChange={(e) => setNuovoTesto(e.target.value)}
                    placeholder="Titolo del film o serie..."
                    autoFocus
                  />
                  {/* Nuovo input di tipo file! */}
                  <Input
                    type="file"
                    accept="image/*" // Permette di selezionare solo file immagine
                    onChange={(e) => setFileCopertina(e.target.files[0])}
                    className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <Button type="submit" className="w-full mt-2">
                    Salva Film
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex justify-end items-center mb-4">
            <Tabs
              value={viewMode}
              onValueChange={setViewMode}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">
                  <FaList className="h-4 w-4 mr-2" /> Lista
                </TabsTrigger>
                <TabsTrigger value="grid">
                  <FaThLarge className="h-4 w-4 mr-2" /> Griglia
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filmList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border bg-background rounded-md shadow-sm">
              Nessun elemento presente. Clicca su "Aggiungi Film" per iniziare!
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-md border bg-background shadow-sm">
              <div className="divide-y divide-border">
                {filmList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    {idInModifica === item.id ? (
                      <div className="flex w-full items-center gap-3">
                        <Input
                          value={testoModificato}
                          onChange={(e) => setTestoModificato(e.target.value)}
                          className="flex-1 bg-background"
                          autoFocus
                        />
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => salvaModifica(item.id)}
                        >
                          <FaCheck className="mr-2 h-4 w-4" /> Salva
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIdInModifica(null)}
                        >
                          <FaTimes className="h-4 w-4" />
                        </Button>
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
                          <div className="font-medium text-foreground">
                            {item.testo}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setIdInModifica(item.id);
                              setTestoModificato(item.testo);
                            }}
                          >
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filmList.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[2/3] bg-muted/50 border-b">
                    {item.copertina ? (
                      <img
                        src={item.copertina}
                        alt={item.testo}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                        Nessuna copertina
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    {idInModifica === item.id ? (
                      <div className="flex flex-col gap-2 w-full mt-2">
                        <Input
                          value={testoModificato}
                          onChange={(e) => setTestoModificato(e.target.value)}
                          className="bg-background text-sm h-8"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 h-8"
                            onClick={() => salvaModifica(item.id)}
                          >
                            <FaCheck className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-8"
                            onClick={() => setIdInModifica(null)}
                          >
                            <FaTimes className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3
                          className="font-semibold text-sm line-clamp-2 mt-2"
                          title={item.testo}
                        >
                          {item.testo}
                        </h3>
                        <div className="flex items-center justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setIdInModifica(item.id);
                              setTestoModificato(item.testo);
                            }}
                          >
                            <FaEdit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setIdDaEliminare(item.id);
                              setIsModalOpen(true);
                            }}
                          >
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Questo eliminerà
              definitivamente il film dalla tua lista e dal nostro database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsModalOpen(false)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfermaElimina}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina Film
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
