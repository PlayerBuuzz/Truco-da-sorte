import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let fila = [];
let mesas = [];

// 🃏 Baralho
const baralhoBase = [
  "4♣","5♣","6♣","7♣","Q♣","J♣","K♣","A♣","2♣","3♣",
  "4♦","5♦","6♦","7♦","Q♦","J♦","K♦","A♦","2♦","3♦",
  "4♥","5♥","6♥","7♥","Q♥","J♥","K♥","A♥","2♥","3♥",
  "4♠","5♠","6♠","7♠","Q♠","J♠","K♠","A♠","2♠","3♠"
];

function embaralhar(baralho) {
  return [...baralho].sort(() => Math.random() - 0.5);
}

function criarMesa(j1, j2) {
  const baralho = embaralhar(baralhoBase);

  const mesa = {
    jogadores: [j1, j2],
    maos: [
      baralho.splice(0, 3),
      baralho.splice(0, 3)
    ],
    turno: 0
  };

  j1.mesa = mesa;
  j2.mesa = mesa;
  mesas.push(mesa);

  // 🎮 START GAME + CARTAS (CORRETO)
  j1.send(JSON.stringify({
    type: "START_GAME",
    cartas: mesa.maos[0],
    turno: true
  }));

  j2.send(JSON.stringify({
    type: "START_GAME",
    cartas: mesa.maos[1],
    turno: false
  }));
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  ws.mesa = null;

  if (fila.length > 0) {
    const oponente = fila.shift();
    criarMesa(oponente, ws);
  } else {
    fila.push(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    const mesa = ws.mesa;
    if (!mesa) return;

    if (data.type === "PLAY_CARD") {
      const idx = mesa.jogadores.indexOf(ws);
      const outro = mesa.jogadores[1 - idx];

      outro.send(JSON.stringify({
        type: "OPPONENT_PLAY",
        carta: data.carta
      }));

      ws.send(JSON.stringify({ type: "WAIT_TURN" }));
      outro.send(JSON.stringify({ type: "YOUR_TURN" }));
    }
  });

  ws.on("close", () => {
    fila = fila.filter(j => j !== ws);
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

server.listen(PORT, () => {
  console.log("🃏 Servidor Truco rodando na porta", PORT);
});
