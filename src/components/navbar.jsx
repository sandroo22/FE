import { FaSignOutAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export function Navbar({ onLogout }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight">Pannello Admin</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="text-muted-foreground hover:text-foreground"
      >
        <FaSignOutAlt className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
