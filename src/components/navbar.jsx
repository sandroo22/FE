import { Button } from "@/components/ui/button";
import { FaSignOutAlt, FaFilm } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Navbar({ onLogout }) {
  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b shadow-sm">
      <div className="flex items-center gap-2 text-xl font-bold text-primary">
        <FaFilm className="text-primary" /> MyFilmTracker
      </div>

      {/* Finestra di conferma per il Logout */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FaSignOutAlt className="mr-2 h-4 w-4" /> Esci
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler uscire?</AlertDialogTitle>
            <AlertDialogDescription>
              Dovrai effettuare nuovamente l'accesso per poter vedere o modificare la tua lista di film.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sì, Esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}