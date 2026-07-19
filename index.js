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
