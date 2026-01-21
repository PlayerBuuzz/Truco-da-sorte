import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let jogadores = [];

const baralho = [
  "4♣","4♥","4♠","4♦",
  "5♣","5♥","5♠","5♦",
  "6♣","6♥","6♠","6♦",
  "7♣","7♥","7♠","7♦",
  "Q♣","Q♥","Q♠","Q♦",
  "J♣","J♥","J♠","J♦",
  "K♣","K♥","K♠","K♦",
  "A♣","A♥","A♠","A♦",
  "2♣","2♥","2♠","2♦",
  "3♣","3♥","3♠","3♦"
];

function embaralhar(cartas) {
  return cartas.sort(() => Math.random() - 0.5);
}

wss.on("connection", ws => {
  jogadores.push(ws);

  if (jogadores.length < 2) {
    ws.send(JSON.stringify({ type: "WAITING" }));
    return;
  }

  // 🔥 JOGO COMEÇA
  const [j1, j2] = jogadores;
  jogadores = [];

  const deck = embaralhar([...baralho]);

  const mao1 = deck.splice(0, 3);
  const mao2 = deck.splice(0, 3);

  j1.send(JSON.stringify({ type: "START_GAME" }));
  j2.send(JSON.stringify({ type: "START_GAME" }));

  j1.send(JSON.stringify({ type: "HAND", cartas: mao1 }));
  j2.send(JSON.stringify({ type: "HAND", cartas: mao2 }));

  j1.send(JSON.stringify({ type: "YOUR_TURN" }));
  j2.send(JSON.stringify({ type: "WAIT_TURN" }));

  j1.on("message", msg => {
    const data = JSON.parse(msg);
    if (data.type === "PLAY_CARD") {
      j2.send(JSON.stringify({
        type: "OPPONENT_PLAY",
        carta: data.carta
      }));
      j2.send(JSON.stringify({ type: "YOUR_TURN" }));
    }
  });

  j2.on("message", msg => {
    const data = JSON.parse(msg);
    if (data.type === "PLAY_CARD") {
      j1.send(JSON.stringify({
        type: "OPPONENT_PLAY",
        carta: data.carta
      }));
      j1.send(JSON.stringify({ type: "YOUR_TURN" }));
    }
  });
});

console.log("🃏 Servidor Truco rodando na porta 8080");
