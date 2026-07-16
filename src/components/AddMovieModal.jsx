import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nuovoTesto, setNuovoTesto] = useState("");
  const [fileCopertina, setFileCopertina] = useState(null);
  const [titoloError, setTitoloError] = useState("");

  const gestisciInvio = (e) => {
    e.preventDefault();
    setTitoloError("");

    if (!nuovoTesto.trim()) {
      setTitoloError("Il titolo del film è obbligatorio.");
      return;
    }

    const formData = new FormData();
    formData.append("testo", nuovoTesto);
    if (fileCopertina) formData.append("copertina", fileCopertina);

    fetch("http://localhost:5000/api/film", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => res.json())
      .then((listaAggiornata) => {
        onFilmAdded(listaAggiornata); // Invia la nuova lista alla Dashboard
        setNuovoTesto("");
        setFileCopertina(null);
        setIsAddModalOpen(false); // Chiude il pop-up
      })
      .catch(console.error);
  };

  return (
    <Dialog
      open={isAddModalOpen}
      onOpenChange={(open) => {
        setIsAddModalOpen(open);
        if (!open) setTitoloError("");
      }}
    >
      <DialogTrigger
        className={buttonVariants({
          size: "lg",
          className: "w-full sm:w-auto shadow-sm",
        })}
      >
        <FaPlus className="mr-2 h-4 w-4" /> Aggiungi Film
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle>Aggiungi alla lista</DialogTitle>
          <DialogDescription>
            Inserisci il titolo e carica una copertina dal tuo computer.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={gestisciInvio}
          className="flex flex-col gap-4 mt-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Input
              value={nuovoTesto}
              onChange={(e) => {
                setNuovoTesto(e.target.value);
                setTitoloError("");
              }}
              placeholder="Titolo del film o serie..."
              className={
                titoloError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              autoFocus
            />
            {titoloError && (
              <span className="text-xs font-semibold text-destructive">
                {titoloError}
              </span>
            )}
          </div>

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFileCopertina(e.target.files[0])}
            className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <Button type="submit" className="w-full mt-2">
            Salva Film
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
