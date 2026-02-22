const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");
const runMigrations = require("./modules/migrate");
require("dotenv").config();
require("./config/passport");

/* ================= ROUTES ================= */
const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const notificationRoute = require("./routes/notifiacationRoute");
const reviewRoute = require("./routes/reviewRoute");
const profileRoute = require("./routes/profileRoute");
const VeryemailRoute = require("./routes/verifyroutes");
const exchangeMessageRoutes = require("./routes/chatRoute");
const AiSkillMatch = require("./routes/AiMatchRoutes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

/* ================= TRUST PROXY ================= */
app.set("trust proxy", 1);

/* ================= CORS ================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://skillwrap2026.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
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
app.use("/", VeryemailRoute);
app.use("/", exchangeMessageRoutes);
app.use("/", AiSkillMatch);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// /* ================= SHARE SESSION WITH SOCKET ================= */
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  passport.initialize()(socket.request, {}, () => {
    passport.session()(socket.request, {}, () => {
      next();
    });
  });
});

/* ================= USER STATE ================= */
const ADMIN = "Admin";
let users = [];

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

function activateUser(id, name, room) {
  const user = { id, name, room };
  users = [...users.filter((u) => u.id !== id), user];
  return user;
}

function userLeavesApp(id) {
  users = users.filter((u) => u.id !== id);
}

function getUser(id) {
  return users.find((u) => u.id === id);
}

function getUsersInRoom(room) {
  return users.filter((u) => u.room === room);
}

function getAllActiveRooms() {
  return [...new Set(users.map((u) => u.room))];
}

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.emit("message", buildMsg(ADMIN, "Welcome!"));

  /* ================= ENTER ROOM ================= */
  socket.on("enterRoom", ({ name, room }) => {
    if (!name) {
      socket.emit("message", buildMsg(ADMIN, "❌ You must provide a name to join a room"));
      return;
    }

    const prevRoom = getUser(socket.id)?.room;
    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit("message", buildMsg(ADMIN, `${name} has left the room`));
      io.to(prevRoom).emit("userList", { users: getUsersInRoom(prevRoom) });
    }

    const userObj = activateUser(socket.id, name, room);
    socket.join(userObj.room);

    socket.emit("message", buildMsg(ADMIN, `You joined ${userObj.room}`));
    socket.broadcast.to(userObj.room).emit("message", buildMsg(ADMIN, `${userObj.name} joined the room`));

    io.to(userObj.room).emit("userList", { users: getUsersInRoom(userObj.room) });
    io.emit("roomsList", { rooms: getAllActiveRooms() });
  });

  /* ================= SEND MESSAGE ================= */
  socket.on("message", ({ text }) => {
    const userObj = getUser(socket.id);
    if (!userObj) return;

    const name = userObj.name || "Guest";
    io.to(userObj.room).emit("message", buildMsg(name, text));
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", () => {
    const userObj = getUser(socket.id);
    if (userObj) {
      io.to(userObj.room).emit("message", buildMsg(ADMIN, `${userObj.name} left the room`));
      userLeavesApp(socket.id);
      io.to(userObj.room).emit("userList", { users: getUsersInRoom(userObj.room) });
      io.emit("roomsList", { rooms: getAllActiveRooms() });
    }
    console.log("🔴 User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
const startServer = async () => {
  try {
    await runMigrations();
    server.listen(PORT, () => console.log(`🚀 SkillWrap backend running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();









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

// /* ================= ALLOWED ORIGINS ================= */
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://skillwrap2026.vercel.app",
// ];

// /* ================= CORS ================= */
// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin) return callback(null, true);

//       if (
//         allowedOrigins.includes(origin) ||
//         origin.endsWith(".vercel.app")
//       ) {
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

// /* ================= PASSPORT ================= */
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

// /* ================= USER STATE (IN MEMORY) ================= */
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

//   socket.emit("message", buildMsg(ADMIN, "Welcome to SkillWrap Chat"));

//   socket.on("enterRoom", ({ name, room }) => {
//     const prevRoom = getUser(socket.id)?.room;

//     /* Leave previous room */
//     if (prevRoom) {
//       socket.leave(prevRoom);

//       io.to(prevRoom).emit(
//         "message",
//         buildMsg(ADMIN, `${name} has left the room`)
//       );

//       io.to(prevRoom).emit("userList", {
//         users: getUsersInRoom(prevRoom),
//       });
//     }

//     /* Activate user */
//     const user = activateUser(socket.id, name, room);

//     /* Join new room */
//     socket.join(user.room);

//     socket.emit(
//       "message",
//       buildMsg(ADMIN, `You joined ${user.room}`)
//     );

//     socket.broadcast
//       .to(user.room)
//       .emit("message", buildMsg(ADMIN, `${user.name} joined the room`));

//     io.to(user.room).emit("userList", {
//       users: getUsersInRoom(user.room),
//     });

//     io.emit("roomsList", {
//       rooms: getAllActiveRooms(),
//     });
//   });

//   socket.on("message", ({ name, text }) => {
//     const room = getUser(socket.id)?.room;

//     if (room) {
//       io.to(room).emit("message", buildMsg(name, text));
//     }
//   });

//   socket.on("disconnect", () => {
//     const user = getUser(socket.id);

//     if (user) {
//       io.to(user.room).emit(
//         "message",
//         buildMsg(ADMIN, `${user.name} left the room`)
//       );

//       userLeavesApp(socket.id);

//       io.to(user.room).emit("userList", {
//         users: getUsersInRoom(user.room),
//       });

//       io.emit("roomsList", {
//         rooms: getAllActiveRooms(),
//       });
//     }

//     console.log("🔴 User disconnected:", socket.id);
//   });
// });

// /* ================= START SERVER ================= */
// const startServer = async () => {
//   try {
//     await runMigrations();

//     server.listen(PORT, () => {
//       console.log(`🚀 SkillWrap backend running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Failed to start server:", err);
//     process.exit(1);
//   }
// };

// startServer();