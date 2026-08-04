import { useState, useEffect } from "react";
import { FaFolderOpen } from "react-icons/fa";
import { Navbar } from "@/components/navbar";
import { AddMovieModal } from "@/components/AddMovieModal";
import { MovieDetailsModal } from "@/components/MovieDetailsModal";
import { Sidebar } from "@/components/Sidebar";
import { DashboardFilters } from "@/components/DashboardFilters";
import { MovieListItem } from "@/components/MovieListItem";
import { MovieCard } from "@/components/MovieCard";

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

export default function Dashboard({ token, onLogout }) {
  const [liste, setListe] = useState([]);
  const [selectedListaId, setSelectedListaId] = useState(null);
  const [nuovaListaNome, setNuovaListaNome] = useState("");
  const [listaInModifica, setListaInModifica] = useState(null);
  const [testoModificaLista, setTestoModificaLista] = useState("");

  const [film, setFilm] = useState([]);
  const [idInModifica, setIdInModifica] = useState(null);
  const [testoModificato, setTestoModificato] = useState("");
  const [listaModificata, setListaModificata] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idDaEliminare, setIdDaEliminare] = useState(null);
  const [isDettaglioOpen, setIsDettaglioOpen] = useState(false);
  const [filmSelezionato, setFilmSelezionato] = useState(null);

  // --- NUOVI STATI PER LA MODALE DI IMPORTAZIONE JSON ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState(null);

  const searchParams = new URLSearchParams(window.location.search);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || "all",
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort") || "default",
  );
  const [viewMode, setViewMode] = useState(searchParams.get("view") || "list");

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    if (searchQuery) currentUrl.searchParams.set("search", searchQuery);
    else currentUrl.searchParams.delete("search");
    if (filterStatus !== "all")
      currentUrl.searchParams.set("status", filterStatus);
    else currentUrl.searchParams.delete("status");
    if (sortOrder !== "default") currentUrl.searchParams.set("sort", sortOrder);
    else currentUrl.searchParams.delete("sort");
    if (viewMode !== "list") currentUrl.searchParams.set("view", viewMode);
    else currentUrl.searchParams.delete("view");
    window.history.replaceState({}, "", currentUrl);
  }, [searchQuery, filterStatus, sortOrder, viewMode]);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/film", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((dati) => {
          if (Array.isArray(dati)) setFilm(dati);
        })
        .catch(console.error);

      fetch("http://localhost:5000/api/liste", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((dati) => {
          if (Array.isArray(dati)) {
            setListe(dati);
            const defaultList = dati.find((l) => l.is_default);
            if (defaultList && !selectedListaId)
              setSelectedListaId(defaultList.id);
          }
        })
        .catch(console.error);
    }
  }, [token, selectedListaId]);

  // --- FUNZIONI DI IMPORT / EXPORT JSON ---
  const esportaJSON = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "libreria_film.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Errore durante l'esportazione", error);
    }
  };

  const importaJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setPendingImportData(json);
        setIsImportModalOpen(true);
      } catch {
        alert("Il file selezionato non è un JSON valido.");
      }
      event.target.value = null;
    };
    reader.readAsText(file);
  };

  const confermaImportazione = async () => {
    if (!pendingImportData) return;
    try {
      const res = await fetch("http://localhost:5000/api/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingImportData),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Errore durante l'importazione nel database.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsImportModalOpen(false);
      setPendingImportData(null);
    }
  };

  const creaNuovaLista = (e) => {
    e.preventDefault();
    if (!nuovaListaNome.trim()) return;
    fetch("http://localhost:5000/api/liste", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome: nuovaListaNome }),
    })
      .then(() => {
        setNuovaListaNome("");
        return fetch("http://localhost:5000/api/liste", {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => res.json())
      .then(setListe)
      .catch(console.error);
  };

  const salvaModificaLista = (id) => {
    if (!testoModificaLista.trim()) return;
    fetch(`http://localhost:5000/api/liste/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome: testoModificaLista }),
    })
      .then(() => {
        setListaInModifica(null);
        return fetch("http://localhost:5000/api/liste", {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => res.json())
      .then(setListe)
      .catch(console.error);
  };

  const eliminaLista = (id) => {
    fetch(`http://localhost:5000/api/liste/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        const defaultList = liste.find((l) => l.is_default);
        if (selectedListaId === id && defaultList)
          setSelectedListaId(defaultList.id);
        return Promise.all([
          fetch("http://localhost:5000/api/liste", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch("http://localhost:5000/api/film", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);
      })
      .then(([nuoveListe, nuoviFilm]) => {
        setListe(nuoveListe);
        setFilm(nuoviFilm);
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
      body: JSON.stringify({
        testo: testoModificato,
        lista_id: listaModificata,
      }),
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
        setIdInModifica(null);
      })
      .catch(console.error);
  };

  const toggleVisto = (id, statoAttuale) => {
    fetch(`http://localhost:5000/api/film/${id}/visto`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ visto: !statoAttuale }),
    })
      .then((res) => res.json())
      .then((lista) => {
        if (Array.isArray(lista)) setFilm(lista);
      })
      .catch(console.error);
  };

  const cambiaVoto = (id, nuovoVoto) => {
    fetch(`http://localhost:5000/api/film/${id}/rating`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: nuovoVoto }),
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

  const filmList = Array.isArray(film) ? film : [];
  const filteredFilms = filmList
    .filter((item) => {
      if (selectedListaId && item.lista_id !== selectedListaId) return false;
      const matchesSearch = item.testo
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      let matchesStatus = true;
      if (filterStatus === "watched") matchesStatus = item.visto;
      if (filterStatus === "unwatched") matchesStatus = !item.visto;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") return a.testo.localeCompare(b.testo);
      if (sortOrder === "desc") return b.testo.localeCompare(a.testo);
      return 0;
    });

  const listaCorrente = liste.find((l) => l.id === selectedListaId);

  const sharedProps = {
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
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Navbar onLogout={onLogout} />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] mx-auto w-full overflow-hidden">
        <Sidebar
          liste={liste}
          selectedListaId={selectedListaId}
          setSelectedListaId={setSelectedListaId}
          nuovaListaNome={nuovaListaNome}
          setNuovaListaNome={setNuovaListaNome}
          creaNuovaLista={creaNuovaLista}
          listaInModifica={listaInModifica}
          setListaInModifica={setListaInModifica}
          testoModificaLista={testoModificaLista}
          setTestoModificaLista={setTestoModificaLista}
          salvaModificaLista={salvaModificaLista}
          eliminaLista={eliminaLista}
          esportaJSON={esportaJSON}
          importaJSON={importaJSON}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6 sm:space-y-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
                  <FaFolderOpen className="text-muted-foreground h-6 w-6 hidden sm:block" />
                  {listaCorrente ? listaCorrente.nome : "I tuoi Film"}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Stai visualizzando {filteredFilms.length} film in questa
                  cartella.
                </p>
              </div>
              <AddMovieModal token={token} onFilmAdded={setFilm} />
            </div>

            <DashboardFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {filmList.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border bg-background rounded-md shadow-sm">
                Nessun elemento presente. Clicca su "Aggiungi Film" per
                iniziare!
              </div>
            ) : filteredFilms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border bg-background rounded-md shadow-sm">
                Nessun film trovato in questa cartella.
              </div>
            ) : viewMode === "list" ? (
              <div className="rounded-md border bg-background shadow-sm">
                <div className="divide-y divide-border">
                  {filteredFilms.map((item) => (
                    <MovieListItem key={item.id} item={item} {...sharedProps} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredFilms.map((item) => (
                  <MovieCard key={item.id} item={item} {...sharedProps} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALE ELIMINAZIONE FILM */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà definitivamente il film dal nostro
              database.
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
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NUOVA MODALE PER L'IMPORTAZIONE JSON */}
      <AlertDialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <AlertDialogContent className="w-[95vw] sm:w-full rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Attenzione: Importante!</AlertDialogTitle>
            <AlertDialogDescription>
              Importando questo file{" "}
              <strong>eliminerai tutti i film e le cartelle attuali</strong> per
              sostituirli con quelli del backup.
              <br />
              <br />
              Vuoi procedere?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsImportModalOpen(false);
                setPendingImportData(null);
              }}
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confermaImportazione}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Sì, Ripristina backup
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
