require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "view", "login.html")));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, "view", "signup.html")));
app.get("/chat", (req, res) => res.sendFile(path.join(__dirname, "view", "chat.html")));

app.use("/api/auth", authRoutes);

// Predefined rooms
const ROOMS = ["room1", "room2", "room3", "room4", "room5"];

const userToSocket = new Map();  
const socketToUser = new Map();  

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

 
  socket.on("register", ({ username }) => {
    if (!username) return;
    userToSocket.set(username, socket.id);
    socketToUser.set(socket.id, username);
  });

  // Join room (1 room only)
  socket.on("joinRoom", async ({ room }) => {
    const username = socketToUser.get(socket.id);
    if (!username) return;

    if (!ROOMS.includes(room)) {
      socket.emit("errorMsg", { message: "Invalid room" });
      return;
    }

    
    for (const r of socket.rooms) {
      if (r !== socket.id) socket.leave(r);
    }

    socket.join(room);
    socket.emit("joinedRoom", { room });

    const history = await GroupMessage.find({ room })
      .sort({ date_sent: 1 })
      .limit(50)
      .lean();

    socket.emit("roomHistory", history);
  });

  socket.on("leaveRoom", () => {
    for (const r of socket.rooms) {
      if (r !== socket.id) socket.leave(r);
    }
    socket.emit("leftRoom");
  });


  socket.on("sendRoomMessage", async ({ room, message }) => {
    const from_user = socketToUser.get(socket.id);
    if (!from_user || !room || !message) return;

    if (!socket.rooms.has(room)) return; 

    const doc = await GroupMessage.create({
      from_user,
      room,
      message
    });

    io.to(room).emit("roomMessage", {
      from_user: doc.from_user,
      room: doc.room,
      message: doc.message,
      date_sent: doc.date_sent
    });
  });

  
  socket.on("sendPrivateMessage", async ({ to_user, message }) => {
    const from_user = socketToUser.get(socket.id);
    if (!from_user || !to_user || !message) return;

    const doc = await PrivateMessage.create({
      from_user,
      to_user,
      message
    });

    const targetSocketId = userToSocket.get(to_user);


    socket.emit("privateMessage", doc);
    if (targetSocketId) io.to(targetSocketId).emit("privateMessage", doc);
  });


  socket.on("typing", ({ to_user, isTyping }) => {
    const from_user = socketToUser.get(socket.id);
    const targetSocketId = userToSocket.get(to_user);
    if (!from_user || !targetSocketId) return;

    io.to(targetSocketId).emit("typing", { from_user, isTyping: !!isTyping });
  });


  socket.on("roomTyping", ({ room, isTyping }) => {
    const from_user = socketToUser.get(socket.id);
    if (!from_user || !room) return;
    if (!socket.rooms.has(room)) return;

    socket.to(room).emit("roomTyping", { from_user, room, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    const username = socketToUser.get(socket.id);
    if (username) userToSocket.delete(username);
    socketToUser.delete(socket.id);
    console.log("user disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();


