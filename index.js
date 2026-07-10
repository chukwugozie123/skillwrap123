// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
// const { Server } = require("socket.io");
// const runMigrations = require("./modules/migrate");
// require("dotenv").config();
// require("./config/passport");

// /* ================= ROUTES ================= */
// const authRoutes = require("./routes/authRoutes");
// const skillRoutes = require("./routes/skillRoutes");
// const exchangeRoutes = require("./routes/exchangeRoutes");
// const uploadRoute = require("./routes/uploadRoutes");
// const notificationRoute = require("./routes/notifiacationRoute");
// const reviewRoute = require("./routes/reviewRoute");
// const profileRoute = require("./routes/profileRoute");
// const VeryemailRoute = require("./routes/verifyroutes");
// const exchangeMessageRoutes = require("./routes/chatRoute");
// const AiSkillMatch = require("./routes/AiMatchRoutes");

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 4000;

// /* ================= TRUST PROXY ================= */
// app.set("trust proxy", 1);

// /* ================= CORS ================= */
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://skillwrap2026.vercel.app",
// ];

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
//         return callback(null, true);
//       }
//       return callback(null, false);
//     },
//     credentials: true,
//   })
// );

// /* ================= BODY PARSERS ================= */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ================= SESSION ================= */
// const sessionMiddleware = session({
//   name: "skillwrap.sid",
//   secret: process.env.SESSION_SECRET || "skillwrap_secret",
//   resave: false,
//   saveUninitialized: false,
//   proxy: true,
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     maxAge: 1000 * 60 * 60 * 24,
//   },
// });

// app.use(sessionMiddleware);
// app.use(passport.initialize());
// app.use(passport.session());

// /* ================= ROUTES ================= */
// app.use("/auth", authRoutes);
// app.use("/", skillRoutes);
// app.use("/", exchangeRoutes);
// app.use("/", uploadRoute);
// app.use("/", reviewRoute);
// app.use("/", profileRoute);
// app.use("/", notificationRoute);
// app.use("/", VeryemailRoute);
// app.use("/", exchangeMessageRoutes);
// app.use("/", AiSkillMatch);

// /* ================= SOCKET.IO ================= */
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//   },
//   pingTimeout: 60000,
//   pingInterval: 25000,
// });

// // /* ================= SHARE SESSION WITH SOCKET ================= */
// io.use((socket, next) => {
//   sessionMiddleware(socket.request, {}, next);
// });
// io.use((socket, next) => {
//   passport.initialize()(socket.request, {}, () => {
//     passport.session()(socket.request, {}, () => {
//       next();
//     });
//   });
// });

// /* ================= USER STATE ================= */
// const ADMIN = "Admin";
// let users = [];

// function buildMsg(name, text) {
//   return {
//     name,
//     text,
//     time: new Intl.DateTimeFormat("default", {
//       hour: "numeric",
//       minute: "numeric",
//       second: "numeric",
//     }).format(new Date()),
//   };
// }

// function activateUser(id, name, room) {
//   const user = { id, name, room };
//   users = [...users.filter((u) => u.id !== id), user];
//   return user;
// }

// function userLeavesApp(id) {
//   users = users.filter((u) => u.id !== id);
// }

// function getUser(id) {
//   return users.find((u) => u.id === id);
// }

// function getUsersInRoom(room) {
//   return users.filter((u) => u.room === room);
// }

// function getAllActiveRooms() {
//   return [...new Set(users.map((u) => u.room))];
// }

// /* ================= SOCKET EVENTS ================= */
// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   socket.emit("message", buildMsg(ADMIN, "Welcome!"));

//   /* ================= ENTER ROOM ================= */
//   socket.on("enterRoom", ({ name, room }) => {
//     if (!name) {
//       socket.emit("message", buildMsg(ADMIN, "❌ You must provide a name to join a room"));
//       return;
//     }

//     const prevRoom = getUser(socket.id)?.room;
//     if (prevRoom) {
//       socket.leave(prevRoom);
//       io.to(prevRoom).emit("message", buildMsg(ADMIN, `${name} has left the room`));
//       io.to(prevRoom).emit("userList", { users: getUsersInRoom(prevRoom) });
//     }

//     const userObj = activateUser(socket.id, name, room);
//     socket.join(userObj.room);

//     socket.emit("message", buildMsg(ADMIN, `You joined ${userObj.room}`));
//     socket.broadcast.to(userObj.room).emit("message", buildMsg(ADMIN, `${userObj.name} joined the room`));

//     io.to(userObj.room).emit("userList", { users: getUsersInRoom(userObj.room) });
//     io.emit("roomsList", { rooms: getAllActiveRooms() });
//   });

//   /* ================= SEND MESSAGE ================= */
//   socket.on("message", ({ text }) => {
//     const userObj = getUser(socket.id);
//     if (!userObj) return;

//     const name = userObj.name || "Guest";
//     io.to(userObj.room).emit("message", buildMsg(name, text));
//   });

//   /* ================= DISCONNECT ================= */
//   socket.on("disconnect", () => {
//     const userObj = getUser(socket.id);
//     if (userObj) {
//       io.to(userObj.room).emit("message", buildMsg(ADMIN, `${userObj.name} left the room`));
//       userLeavesApp(socket.id);
//       io.to(userObj.room).emit("userList", { users: getUsersInRoom(userObj.room) });
//       io.emit("roomsList", { rooms: getAllActiveRooms() });
//     }
//     console.log("🔴 User disconnected:", socket.id);
//   });
// });

// /* ================= START SERVER ================= */
// const startServer = async () => {
//   try {
//     await runMigrations();
//     server.listen(PORT, () => console.log(`🚀 SkillWrap backend running on port ${PORT}`));
//   } catch (err) {
//     console.error("❌ Failed to start server:", err);
//     process.exit(1);
//   }
// };

// startServer();




























require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");
const runMigrations = require("./modules/migrate");
const pool = require("./modules/db"); // Postgres pool

// Import your routes
const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const notificationRoute = require("./routes/notifiacationRoute");
const reviewRoute = require("./routes/reviewRoute");
const profileRoute = require("./routes/profileRoute");
const verifyEmailRoute = require("./routes/verifyroutes");
const exchangeMessageRoutes = require("./routes/chatRoute");
const AiSkillMatch = require("./routes/AiMatchRoutes");
const chatRoute = require("./routes/chatRoute")
const AchivementRoute = require('./routes/AchivementRoute');
const EventRoute = require("./routes/EventRoute");
const ActivityRoute = require("./routes/ActivityRoute")
const XpRoute = require("./routes/XpRoute");
const aiEventRoute = require("./routes/aiEventRoute");

require("./config/passport"); // Passport config



const  setupExchangeSocket  = require("./socket/exchangeSocket");
const  setupEventAISocket = require("./socket/eventAISocket");


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

/* ================= TRUST PROXY ================= */
app.set("trust proxy", 1);


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://skillwrap2026.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🔥 Incoming Origin:", origin);

      // allow requests with no origin (Postman, server-to-server, mobile apps)
      if (!origin) return callback(null, true);

      // allow your real frontend origins
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      // allow chrome extensions ONLY in development
      if (
        process.env.NODE_ENV === "development" &&
        origin.startsWith("chrome-extension://")
      ) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED ORIGIN:", origin);
      return callback(null, false);
    },
    credentials: true,
  })
);

/* ================= BODY PARSERS ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= SESSION ================= */
const sessionMiddleware = session({
  name: "skillwrap.sid",
  secret: process.env.SESSION_SECRET || "skillwrap_secret",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

/* ================= ROUTES ================= */
app.use("/auth", authRoutes);
app.use("/", skillRoutes);
app.use("/", exchangeRoutes);
app.use("/", uploadRoute);
app.use("/", reviewRoute);
app.use("/", profileRoute);
app.use("/", notificationRoute);
app.use("/", verifyEmailRoute);
app.use("/", exchangeMessageRoutes);
app.use("/", AiSkillMatch);
app.use("/", chatRoute);
app.use("/achievements", AchivementRoute);
app.use("/", EventRoute);
app.use("/", ActivityRoute);
app.use("/", XpRoute);
app.use("/", aiEventRoute);

app.use((err, req, res, next) => {
  console.error("========== GLOBAL ERROR ==========");
  console.error(err);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});


/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Share session with Socket.IO
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
io.use((socket, next) => {
  passport.initialize()(socket.request, {}, () => {
    passport.session()(socket.request, {}, next);
  });
});

/* ================= SOCKET STATE ================= */
let activeUsers = [];

function getUser(socketId) {
  return activeUsers.find(u => u.socketId === socketId);
}

function removeUser(socketId) {
  activeUsers = activeUsers.filter(u => u.socketId !== socketId);
}

const activeExchanges = {}; // { roomId: { interval, endTime, timeLeft } }


io.on("connection", (socket)=>{

    setupExchangeSocket(io, socket);

    setupEventAISocket(io, socket);

});

// io.on("connection", (socket) => {
//   console.log("✅ Socket connected:", socket.id);

//   /* ================= ENTER PRIVATE ROOM ================= */
//   socket.on("enterRoom", async ({ roomId, userId }) => {
//     console.log("📥 enterRoom received:", { roomId, userId });

//     try {
//       if (!roomId || !userId) {
//         console.log("❌ Missing roomId or userId");
//         return;
//       }

//       const roomRes = await pool.query(
//         "SELECT * FROM rooms WHERE exchange_id = $1",
//         [roomId]
//       );

//       if (roomRes.rows.length === 0) {
//         console.log("❌ No room found for exchange_id:", roomId);
//         return;
//       }

//       const room = roomRes.rows[0];
//       const socketRoom = `room_001${room.id}`;

//       console.log("🏷 Joining socket room:", socketRoom);

//       socket.join(socketRoom);

//       activeUsers.push({
//         socketId: socket.id,
//         userId,
//         roomId: room.id,
//         socketRoom
//       });

//       const userRes = await pool.query(
//         "SELECT username FROM users WHERE id = $1",
//         [userId]
//       );

//       const username = userRes.rows[0].username;

//       socket.emit("message", {
//         text: "Welcome to your exchange chat",
//         username: "System",
//         created_at: new Date()
//       });

//       socket.to(socketRoom).emit("message", {
//         text: `${username} joined the chat`,
//         username: "System",
//         created_at: new Date()
//       });

//       const messagesRes = await pool.query(
//         `SELECT messages.id, messages.text, messages.created_at, users.username
//          FROM messages
//          JOIN users ON users.id = messages.sender_id
//          WHERE room_id = $1
//          ORDER BY messages.created_at ASC`,
//         [room.id]
//       );

//       // console.log("📜 Loaded previous messages:", messagesRes.rows.length);

//       socket.emit("previousMessages", messagesRes.rows);

//       const usersInRoom = activeUsers.filter(u => u.roomId === room.id);

//       if (activeExchanges[socketRoom]) {
//         console.log("⏱ Existing countdown found. Sending timeLeft:",
//           activeExchanges[socketRoom].timeLeft
//         );
//         socket.emit("countdown", activeExchanges[socketRoom].timeLeft);
//       }

//     } catch (err) {
//       console.error("❌ EnterRoom Error:", err);
//     }
//   });

//   /* ================= SEND MESSAGE ================= */
//   socket.on("message", async ({ text }) => {
//     try {
//       const user = activeUsers.find(u => u.socketId === socket.id);
//       if (!user || !text) return;

//       const msgRes = await pool.query(
//         `INSERT INTO messages (room_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *`,
//         [user.roomId, user.userId, text]
//       );

//       const userRes = await pool.query("SELECT username FROM users WHERE id = $1", [user.userId]);
//       const username = userRes.rows[0].username;

//       io.to(user.socketRoom).emit("message", {
//         id: msgRes.rows[0].id,
//         text: msgRes.rows[0].text,
//         username,
//         created_at: msgRes.rows[0].created_at,
//       });

//     } catch (err) {
//       console.error("Message Error:", err);
//     }
//   });

//   /* ================= TYPING ================= */
//   socket.on("typing", ({ name }) => {
//     const user = activeUsers.find(u => u.socketId === socket.id);
//     if (!user) return;
//     socket.to(user.socketRoom).emit("typing", { name });
//   });


//   /* ================= START COUNTDOWN ================= */
//   socket.on("startCountdown", async ({ roomId, exchangeId, duration }) => {
//     console.log("📥 startCountdown received:", {
//       roomId,
//       exchangeId,
//       duration
//     });

    
//       const roomRes = await pool.query(
//         "SELECT * FROM rooms WHERE exchange_id = $1",
//         [roomId]
//       );

//       const room = roomRes.rows[0]

//     const socketRoom = `room_001${room.id}`;
//     console.log("🏷 Using socketRoom:", socketRoom);

//     if (activeExchanges[socketRoom]) {
//       console.log("⚠ Countdown already running for this room");
//       return;
//     }

//     const endTime = Date.now() + duration * 60 * 1000;

//     const interval = setInterval(async () => {
//       const diff = endTime - Date.now();

//       const mins = Math.floor(diff / 60000);
//       const secs = Math.floor((diff % 60000) / 1000);

//       const formatted = `${mins
//         .toString()
//         .padStart(2, "0")}:${secs
//         .toString()
//         .padStart(2, "0")}`;

//       activeExchanges[socketRoom] = {
//         interval,
//         endTime,
//         timeLeft: formatted
//       };

//       // console.log("⏳ Emitting countdown:", formatted, "to", socketRoom);

//       io.to(socketRoom).emit("countdown", formatted);

//       if (diff <= 0) {
//         console.log("✅ Countdown finished for room:", socketRoom);

//         clearInterval(interval);
//         io.to(socketRoom).emit("countdownEnded");
//         delete activeExchanges[socketRoom];
//       }
//     }, 1000);
//   });

//   /* ================= QUIT EXCHANGE ================= */
//   socket.on("quitExchange", async ({ roomId, exchangeId }) => {
//       const roomRes = await pool.query(
//         "SELECT * FROM rooms WHERE exchange_id = $1",
//         [roomId]
//       );

//       const room = roomRes.rows[0]

//     const socketRoom = `room_001${room.id}`;
//     console.log("🏷 Quitting socketRoom:", socketRoom);

//     if (activeExchanges[socketRoom]) {
//       clearInterval(activeExchanges[socketRoom].interval);
//       delete activeExchanges[socketRoom];
//     }

//     io.to(socketRoom).emit("exchangeQuit");
//   });

//   /* ================= DISCONNECT ================= */
//   socket.on("disconnect", async () => {
//     console.log("❌ Socket disconnected:", socket.id);

//     try {
//       const index = activeUsers.findIndex(u => u.socketId === socket.id);
//       if (index === -1) return;

//       const user = activeUsers[index];
//       activeUsers.splice(index, 1);

//       console.log("👋 User removed from activeUsers:", user);

//       io.to(user.socketRoom).emit("message", {
//         text: `A user left the chat`,
//         username: "System",
//         created_at: new Date(),
//       });

//     } catch (err) {
//       console.error("❌ Disconnect Error:", err);
//     }
//   });
// });














server.listen(PORT, () => {
  console.log(`🚀 Backend + Socket.IO running on port ${PORT}`);
});
// app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
// /* ================= START SERVER ================= */
// const startServer = async () => {
//   try {
//     await runMigrations(); // ensure tables exist
//     server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
//   } catch (err) {
//     console.error("❌ Server failed to start:", err);
//     process.exit(1);
//   }
// };
// startServer();
