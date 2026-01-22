const socket = io("https://truco-da-sorte.onrender.com");
const sala = localStorage.getItem("sala");
const id = localStorage.getItem("id");
const cartas = JSON.parse(localStorage.getItem("cartas"));

document.getElementById("sala").textContent = sala;

const cartasDiv = document.getElementById("cartas");
cartas.forEach(carta => {
  const btn = document.createElement("button");
  btn.textContent = carta;
  btn.onclick = () => {
    socket.emit("playCard", { sala, carta });
    addMensagem("Você jogou: " + carta);
    btn.disabled = true;
  };
  cartasDiv.appendChild(btn);
});

function callTruco() {
  socket.emit("callTruco", sala);
  addMensagem("Você pediu TRUCO!");
}

socket.on("opponentPlayed", (carta) => {
  addMensagem("Oponente jogou: " + carta);
});

socket.on("trucoCalled", () => {
  addMensagem("Oponente pediu TRUCO!");
});

function addMensagem(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("mensagens").appendChild(li);
}
