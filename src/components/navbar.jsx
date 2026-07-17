import { FaSignOutAlt, FaFilm } from "react-icons/fa";
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
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
      
      {/* Logo Cinematografico Modificato */}
      <div className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tighter text-white uppercase">
        <FaFilm className="text-primary drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" /> 
        {/* QUI ABBIAMO CAMBIATO IL TITOLO */}
        <span>PIATTAFORMA <span className="text-primary">FILM/SERIE</span></span>
      </div>

      <AlertDialog>
        <AlertDialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "border-white/20 text-white hover:bg-white/10 hover:text-white transition-all" })}>
          <FaSignOutAlt className="mr-2 h-4 w-4" /> Esci
        </AlertDialogTrigger>
        
        <AlertDialogContent className="w-[95vw] sm:w-full rounded-lg border-white/10 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Sei sicuro di voler uscire?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Dovrai effettuare nuovamente l'accesso per poter vedere o modificare la tua lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout} className="bg-primary text-white hover:bg-primary/90">
              Sì, Esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}