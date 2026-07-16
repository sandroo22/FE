import { FaSignOutAlt, FaFilm } from "react-icons/fa";
// Importiamo buttonVariants per usare lo stile del bottone senza creare il tag HTML
import { buttonVariants } from "@/components/ui/button";
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

      <AlertDialog>
        {/* Usiamo className={buttonVariants(...)} invece di asChild + <Button> */}
        <AlertDialogTrigger
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <FaSignOutAlt className="mr-2 h-4 w-4" /> Esci
        </AlertDialogTrigger>

        <AlertDialogContent className="w-[95vw] sm:w-full rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler uscire?</AlertDialogTitle>
            <AlertDialogDescription>
              Dovrai effettuare nuovamente l'accesso per poter vedere o
              modificare la tua lista di film.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={onLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sì, Esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
