import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // depois trocar para URL do Render

function App() {
  const [room, setRoom] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("startGame", (data) => {
      setMessages(prev => [...prev, "Partida iniciada!"]);
    });

    socket.on("opponentPlayed", (card) => {
      setMessages(prev => [...prev, `Oponente jogou: ${card}`]);
    });

    socket.on("trucoCalled", () => {
      setMessages(prev => [...prev, "Oponente pediu TRUCO!"]);
    });
  }, []);

  const joinRoom = () => {
    socket.emit("joinRoom", room);
    setConnected(true);
  };

  const playCard = (card) => {
    socket.emit("playCard", { roomId: room, card });
  };

  const callTruco = () => {
    socket.emit("callTruco", room);
  };

  return (
    <div style={{ padding: 20 }}>
      {!connected ? (
        <>
          <input
            placeholder="Digite o nome da sala"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Entrar na sala</button>
        </>
      ) : (
        <>
          <h2>Sala: {room}</h2>
          <button onClick={() => playCard("Ás de Espadas")}>Jogar Ás de Espadas</button>
          <button onClick={callTruco}>Pedir TRUCO</button>
          <div>
            <h3>Mensagens:</h3>
            <ul>
              {messages.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
