import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const PORT = process.env.PORT || 3000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let mesas = [];

// Cria baralho do truco paulista
function criarBaralho() {
  const naipes = ["♠", "♥", "♦", "♣"];
  const valores = ["4","5","6","7","Q","J","K","A","2","3"];
  let baralho = [];
  for (let v of valores) {
    for (let n of naipes) {
      baralho.push(v + n);
    }
  }
  return baralho.sort(() => Math.random() - 0.5);
}

// Cria mesa com primeiro jogador
function criarMesa(ws) {
  const mesa = {
    id: Date.now(),
    jogadores: [ws],
    baralho: criarBaralho(),
    hands: [] // agora é array, não objeto
  };
  mesas.push(mesa);
  return mesa;
}

// Procura mesa com apenas 1 jogador
function procurarMesa() {
  return mesas.find(m => m.jogadores.length === 1);
}

wss.on("connection", (ws) => {
  console.log("Jogador conectado");

  let mesa = procurarMesa();

  if (mesa) {
    mesa.jogadores.push(ws);

    // Distribui cartas para os dois jogadores
    mesa.hands = [
      mesa.baralho.splice(0,3),
      mesa.baralho.splice(0,3)
    ];

    // Envia cartas e início do jogo
    mesa.jogadores.forEach((jogador, idx) => {
      jogador.send(JSON.stringify({
        type: "START_GAME",
        hand: mesa.hands[idx], // ✅ agora funciona
        player: idx
      }));
    });

  } else {
    criarMesa(ws);
    ws.send(JSON.stringify({ type: "WAITING" }));
  }

  // Mensagens recebidas do cliente
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "PLAY_CARD") {
      let mesa = mesas.find(m => m.jogadores.includes(ws));
      mesa.jogadores.forEach(j => {
        if (j !== ws) {
          j.send(JSON.stringify({ type: "CARD_PLAYED", carta: data.carta }));
        }
      });
    }

    if (data.type === "TRUCO") {
      let mesa = mesas.find(m => m.jogadores.includes(ws));
      mesa.jogadores.forEach(j => {
        if (j !== ws) {
          j.send(JSON.stringify({ type: "TRUCO" }));
        }
      });
    }
  });

  // Quando jogador desconecta
  ws.on("close", () => {
    mesas = mesas.filter(m => !m.jogadores.includes(ws));
  });
});

// Render escuta aqui
server.listen(PORT, () => {
  console.log("Servidor Truco rodando na porta", PORT);
});
