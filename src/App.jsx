import { useState, useEffect } from 'react'
import './App.css' 

function App() {
  const [attivita, setAttivita] = useState([]);
  const [nuovoTesto, setNuovoTesto] = useState('');
  const [idInModifica, setIdInModifica] = useState(null);
  const [testoModificato, setTestoModificato] = useState('');

  // 1. GET: Carica le attività
  useEffect(() => {
    fetch('http://localhost:5000/api/attivita')
      .then(risposta => risposta.json())
      .then(dati => setAttivita(dati))
      .catch(errore => console.error("Errore nel caricamento:", errore));
  }, []);

  // 2. POST: Aggiunge una nuova attività
  const gestisciInvio = (e) => {
    e.preventDefault();
    if (!nuovoTesto.trim()) return;

    fetch('http://localhost:5000/api/attivita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testo: nuovoTesto })
    })
    .then(risposta => risposta.json())
    .then(listaAggiornata => {
      setAttivita(listaAggiornata);
      setNuovoTesto('');
    })
    .catch(errore => console.error("Errore nell'invio:", errore));
  };

  // 3. PUT: Salva la modifica
  const salvaModifica = (id) => {
    if (!testoModificato.trim()) return;

    fetch(`http://localhost:5000/api/attivita/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testo: testoModificato })
    })
    .then(risposta => risposta.json())
    .then(listaAggiornata => {
      setAttivita(listaAggiornata);
      setIdInModifica(null);
    })
    .catch(errore => console.error("Errore nella modifica:", errore));
  };

  const formattaData = (dataStringa) => {
    if (!dataStringa) return '';
    const data = new Date(dataStringa);
    return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Lista delle Attività</h1>
      
      <form onSubmit={gestisciInvio} className="todo-form">
        <input 
          type="text" 
          placeholder="Nuova attività..." 
          value={nuovoTesto}
          onChange={(e) => setNuovoTesto(e.target.value)}
          className="input-create"
        />
        <button type="submit" className="btn-create">Aggiungi</button>
      </form>

      <div className="list-container">
        <ul className="todo-list">
          {attivita.map((item) => (
            <li key={item.id} className="todo-item">
              {idInModifica === item.id ? (
                <div className="edit-container">
                  <input 
                    type="text" 
                    value={testoModificato} 
                    onChange={(e) => setTestoModificato(e.target.value)}
                    className="input-edit"
                  />
                  <button onClick={() => salvaModifica(item.id)} className="btn-save">Salva</button>
                  <button onClick={() => setIdInModifica(null)} className="btn-cancel">Annulla</button>
                </div>
              ) : (
                <div className="view-container">
                  <div>
                    <span className="todo-text">{item.testo}</span>
                    <div className="todo-dates">
                      Creato: {formattaData(item.createdAt)} | Modificato: {formattaData(item.updatedAt)}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIdInModifica(item.id);
                      setTestoModificato(item.testo);
                    }} 
                    className="btn-edit"
                  >
                    Modifica
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App