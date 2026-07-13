import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const handleAuth = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setAuthMessage("Inserisci username e password!");
      setIsAuthModalOpen(true);
      return;
    }

    const endpoint = isLoginMode ? "http://localhost:5000/api/login" : "http://localhost:5000/api/register";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then(async (risposta) => {
        const dati = await risposta.json().catch(() => ({})); 

        if (!risposta.ok) {
          throw new Error(dati.errore || dati.error || dati.message || "Credenziali errate o utente non trovato.");
        }
        
        if (dati.errore) {
             throw new Error(dati.errore);
        }

        return dati;
      })
      .then((dati) => {
        if (dati.token) {
          localStorage.setItem("token", dati.token);
          // Invece di usare setToken qui, avvisiamo App.jsx che il login è andato a buon fine!
          onLoginSuccess(dati.token); 
        } else if (!isLoginMode) {
          setAuthMessage("Registrazione completata!");
          setIsAuthModalOpen(true);
          setIsLoginMode(true);
        }
      })
      .catch((err) => {
        setAuthMessage(err.message === "Failed to fetch" ? "Errore di connessione al server." : err.message);
        setIsAuthModalOpen(true);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm border-border shadow-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Pagina di Accesso</CardTitle>
          <CardDescription>
            {isLoginMode ? "Accedi alla piattaforma" : "Registrati alla piattaforma"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Inserisci il tuo username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full mt-2">{isLoginMode ? "Accedi" : "Registrati"}</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={() => setIsLoginMode(!isLoginMode)} className="w-full text-muted-foreground text-sm">
            {isLoginMode ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
          </Button>
        </CardFooter>
      </Card>

      {isAuthModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Avviso</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{authMessage}</p></CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button onClick={() => setIsAuthModalOpen(false)}>Chiudi</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}