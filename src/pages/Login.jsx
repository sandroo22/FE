import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function Login({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Stati separati per ogni singolo campo
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState(""); 
  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Espressione regolare per controllare se l'email ha un formato valido (es. contiene la @)
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuth = (e) => {
    e.preventDefault();
    
    // Azzera tutti gli errori a ogni tentativo
    setEmailError("");
    setPasswordError("");
    setServerError("");

    let hasErrors = false;

    // CONTROLLI LATO CLIENT (Campi vuoti o errati)
    if (!email.trim()) {
      setEmailError("L'email è obbligatoria.");
      hasErrors = true;
    } else if (!isEmailValid(email)) {
      setEmailError("Formato email non valido.");
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError("La password è obbligatoria.");
      hasErrors = true;
    }

    // Se ci sono errori, blocca l'invio
    if (hasErrors) return;

    const endpoint = isLoginMode ? "http://localhost:5000/api/login" : "http://localhost:5000/api/register";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (risposta) => {
        const dati = await risposta.json().catch(() => ({})); 
        if (!risposta.ok) throw new Error(dati.errore || dati.error || dati.message || "Credenziali errate.");
        if (dati.errore) throw new Error(dati.errore);
        return dati;
      })
      .then((dati) => {
        if (dati.token) {
          localStorage.setItem("token", dati.token);
          onLoginSuccess(dati.token); 
        } else if (!isLoginMode) {
          setIsSuccessModalOpen(true);
          setIsLoginMode(true);
          setEmail("");
          setPassword("");
        }
      })
      .catch((err) => {
        const errorMsg = err.message;
        // CONTROLLI LATO SERVER: Smistiamo i messaggi sotto il campo corretto
        if (errorMsg.toLowerCase().includes("password")) {
          setPasswordError("Password errata.");
        } else if (errorMsg.toLowerCase().includes("utente") || errorMsg.toLowerCase().includes("esiste già")) {
          setEmailError(errorMsg);
        } else if (errorMsg === "Failed to fetch") {
          setServerError("Errore di connessione al server.");
        } else {
          setServerError(errorMsg);
        }
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
          {/* Aggiunto noValidate per spegnere i fastidiosi popup del browser */}
          <form onSubmit={handleAuth} className="grid gap-4" noValidate>
            
            {/* CAMPO EMAIL */}
            <div className="grid gap-2">
              <Label htmlFor="email" className={emailError ? "text-destructive" : ""}>Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Inserisci la tua email" 
                value={email} 
                className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={(e) => {setEmail(e.target.value); setEmailError(""); setServerError("");}} 
              />
              {/* Scritta rossa sotto l'email */}
              {emailError && <span className="text-xs font-semibold text-destructive">{emailError}</span>}
            </div>
            
            {/* CAMPO PASSWORD */}
            <div className="grid gap-2">
              <Label htmlFor="password" className={passwordError ? "text-destructive" : ""}>Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  className={`pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  onChange={(e) => {setPassword(e.target.value); setPasswordError(""); setServerError("");}} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {/* Scritta rossa sotto la password */}
              {passwordError && <span className="text-xs font-semibold text-destructive">{passwordError}</span>}
            </div>

            {/* Eventuale errore generico del server */}
            {serverError && (
              <p className="text-sm font-semibold text-destructive text-center mt-1">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full mt-2">{isLoginMode ? "Accedi" : "Registrati"}</Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={() => {setIsLoginMode(!isLoginMode); setEmailError(""); setPasswordError(""); setServerError("");}} className="w-full text-muted-foreground text-sm">
            {isLoginMode ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
          </Button>
        </CardFooter>
      </Card>

      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Benvenuto!</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Registrazione completata con successo! Ora puoi accedere.</p></CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button onClick={() => setIsSuccessModalOpen(false)}>Chiudi e Accedi</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}