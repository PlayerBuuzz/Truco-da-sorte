import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;

const server = http.createServer();
const wss = new WebSocketServer({ server });

let mesas = [];

/* 🃏 Baralho Truco Paulista */
const BARALHO = [
  "4♣","5♣","6♣","7♣","Q♣","J♣","K♣","A♣","2♣","3♣",
  "4♥","5♥","6♥","7♥","Q♥","J♥","K♥","A♥","2♥","3♥",
  "4♠","5♠","6♠","7♠","Q♠","J♠","K♠","A♠","2♠","3♠",
  "4♦","5♦","6♦","7♦","Q♦","J♦","K♦","A♦","2♦","3♦"
];

function embaralhar(baralho) {
  return [...baralho].sort(() => Math.random() - 0.5);
}

function criarMesa(ws) {
  const mesa = {
    id: Date.now(),
    jogadores: [ws],
    maos: [],
    turno: 0
  };
  mesas.push(mesa);
  return mesa;
}

function procurarMesa() {
  return mesas.find(m => m.jogadores.length === 1);
}

function iniciarJogo(mesa) {
  const baralho = embaralhar(BARALHO);

  mesa.maos[0] = baralho.splice(0, 3);
  mesa.maos[1] = baralho.splice(0, 3);

  mesa.jogadores[0].send(JSON.stringify({
    type: "HAND",
    cartas: mesa.maos[0]
  }));

  mesa.jogadores[1].send(JSON.stringify({
    type: "HAND",
    cartas: mesa.maos[1]
  }));

  mesa.turno = Math.random() < 0.5 ? 0 : 1;

  mesa.jogadores[mesa.turno].send(JSON.stringify({
    type: "YOUR_TURN"
  }));
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  let mesa = procurarMesa();

  if (mesa) {
    mesa.jogadores.push(ws);

    mesa.jogadores.forEach(j =>
      j.send(JSON.stringify({ type: "START_GAME" }))
    );

    iniciarJogo(mesa);

  } else {
    mesa = criarMesa(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    const mesaAtual = mesas.find(m => m.jogadores.includes(ws));
    if (!mesaAtual) return;

    const idx = mesaAtual.jogadores.indexOf(ws);
    const outro = idx === 0 ? 1 : 0;

    if (data.type === "PLAY_CARD") {
      if (mesaAtual.turno !== idx) return;

      mesaAtual.maos[idx] = mesaAtual.maos[idx].filter(c => c !== data.carta);

      mesaAtual.jogadores[outro].send(JSON.stringify({
        type: "OPPONENT_PLAY",
        carta: data.carta
      }));

      mesaAtual.turno = outro;
      mesaAtual.jogadores[outro].send(JSON.stringify({
        type: "YOUR_TURN"
      }));
    }
  });

  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

server.listen(PORT, () => {
  console.log("Servidor Truco rodando na porta", PORT);
});
