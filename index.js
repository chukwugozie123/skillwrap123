

// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
// const { Server } = require("socket.io");
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

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 5000;

// /* ================= TRUST PROXY (RENDER) ================= */
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
//       if (!allowedOrigins.includes(origin)) {
//         return callback(new Error("CORS blocked"), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true,
//   })
// );

// /* ================= MIDDLEWARE ================= */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static("uploads"));

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

// /* ================= SOCKET.IO ================= */
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
//   pingTimeout: 60000,       // 🔥 IMPORTANT FOR RENDER
//   pingInterval: 25000,      // 🔥 IMPORTANT FOR RENDER
// });

// /* 🔥 SHARE SESSION WITH SOCKET.IO */
// io.use((socket, next) => {
//   sessionMiddleware(socket.request, {}, next);
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   /* JOIN ROOM */
//   socket.on("join-room", ({ room, username }) => {
//     if (!room || !username) return;

//     socket.join(room);

//     console.log(`👤 ${username} joined ${room}`);
//     console.log("📦 Current rooms:", [...socket.rooms]);

//     socket.to(room).emit("user_joined", {
//       message: `${username} joined the exchange`,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   /* SEND MESSAGE */
//   socket.on("message", ({ room, sender, message, imageUrl }) => {
//     if (!room) return;

//     console.log(`💬 Message in ${room} from ${sender}`);

//     socket.to(room).emit("message", {
//       sender,
//       message,
//       imageUrl,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   /* START EXCHANGE TIMER */
//   socket.on("start_exchange", ({ room, startTime, duration }) => {
//     if (!room) return;

//     console.log(`⏱ Exchange started in ${room}`);

//     io.to(room).emit("start_exchange", {
//       startTime,
//       duration,
//     });
//   });

//   /* LEAVE ROOM */
//   socket.on("leave-room", ({ room, username }) => {
//     socket.leave(room);

//     console.log(`🚪 ${username} left ${room}`);

//     socket.to(room).emit("user_left", {
//       message: `${username} left the exchange`,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   socket.on("disconnect", (reason) => {
//     console.log("🔴 Socket disconnected:", socket.id, reason);
//   });

//   socket.on("error", (err) => {
//     console.error("❌ Socket error:", err);
//   });
// });

// /* ================= START SERVER ================= */
// server.listen(PORT, () => {
//   console.log(`🚀 SkillWrapp backend running on port ${PORT}`);
// });







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

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;




/* ================= TRUST PROXY ================= */
app.set("trust proxy", 1);

/* ================= ALLOWED ORIGINS ================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://skillwrap2026.vercel.app",
];


const multer = require("multer");

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }

  next();
});


/* ================= CORS (FIXED) ================= */
app.use(
  cors({
    origin(origin, callback) {
      // allow server-to-server & same-origin
      if (!origin) return callback(null, true);

      // allow any vercel preview deployment
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      // ❌ DO NOT THROW ERROR (causes HTML response)
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

/* ================= PASSPORT ================= */
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

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

/* SHARE SESSION WITH SOCKET.IO */
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join-room", ({ room, username }) => {
    if (!room || !username) return;

    socket.join(room);
    socket.to(room).emit("user_joined", {
      message: `${username} joined the exchange`,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("message", ({ room, sender, message, imageUrl }) => {
    if (!room) return;

    socket.to(room).emit("message", {
      sender,
      message,
      imageUrl,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("start_exchange", ({ room, startTime, duration }) => {
    if (!room) return;

    io.to(room).emit("start_exchange", {
      startTime,
      duration,
    });
  });

  socket.on("leave-room", ({ room, username }) => {
    socket.leave(room);
    socket.to(room).emit("user_left", {
      message: `${username} left the exchange`,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", socket.id, reason);
  });
});

/* ================= START ================= */
const startServer = async () => {
  try {
    await runMigrations(); // ✅ SAFE HERE

    server.listen(PORT, () => {
      console.log(`🚀 SkillWrap backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1); // stop app if migrations fail
  }
};

startServer();
