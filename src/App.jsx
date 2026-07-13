import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Se non c'è il token, mostra la pagina di Login
  if (!token) {
    return <Login onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  // Altrimenti, mostra la Dashboard passando il token e la funzione di logout
  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;