const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    socket.join(roomId);

    if (rooms[roomId].length === 2) {
      io.to(roomId).emit("startGame", { players: rooms[roomId] });
    }
  });

  socket.on("playCard", ({ roomId, card }) => {
    socket.to(roomId).emit("opponentPlayed", card);
  });

  socket.on("callTruco", (roomId) => {
    socket.to(roomId).emit("trucoCalled");
  });

  socket.on("disconnect", () => {
    console.log("Jogador saiu:", socket.id);
    for (let roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });
});

app.get("/", (req, res) => {
  res.send("Servidor de Truco Online ativo!");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
