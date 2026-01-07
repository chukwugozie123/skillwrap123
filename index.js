const express = require("express");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const { Server } = require("socket.io");
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

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* ================= TRUST PROXY (RENDER) ================= */
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
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS blocked"), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

/* ================= SESSION ================= */
app.use(
  session({
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
  })
);

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

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  /* JOIN ROOM */
  socket.on("join-room", ({ room, username }) => {
    if (!room || !username) return;
    socket.join(room);

    socket.to(room).emit("user_joined", {
      message: `${username} joined the exchange`,
      timestamp: new Date().toISOString(),
    });

    console.log(`👤 ${username} joined ${room}`);
  });

  /* SEND MESSAGE */
  socket.on("message", ({ room, sender, message, imageUrl }) => {
    if (!room) return;

    socket.to(room).emit("message", {
      sender,
      message,
      imageUrl,
      timestamp: new Date().toISOString(),
    });
  });

  /* START EXCHANGE TIMER */
  socket.on("start_exchange", ({ room, startTime, duration }) => {
    if (!room) return;

    io.to(room).emit("start_exchange", {
      startTime,
      duration,
    });

    console.log(`⏱ Exchange started in ${room}`);
  });

  /* LEAVE ROOM */
  socket.on("leave-room", ({ room, username }) => {
    socket.leave(room);

    socket.to(room).emit("user_left", {
      message: `${username} left the exchange`,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
server.listen(PORT, () => {
  console.log(`🚀 SkillWrapp backend running on port ${PORT}`);
});










// const express = require("express");
// const session = require("express-session");
// const cors = require("cors");
// const passport = require("passport");
// const http = require("http");
// const { Server } = require("socket.io");
// require("dotenv").config();
// require("./config/passport");

// // ROUTES
// const authRoutes = require("./routes/authRoutes");
// const skillRoutes = require("./routes/skillRoutes");
// const exchangeRoutes = require("./routes/exchangeRoutes");
// const uploadRoute = require("./routes/uploadRoutes");
// const notificationRoute = require("./routes/notifiacationRoute");
// const reviewRoute = require("./routes/reviewRoute");
// const profileRoute = require("./routes/profileRoute");

// const app = express();
// const port = process.env.PORT || 5000;
// const server = http.createServer(app);

// /* ================= TRUST PROXY (REQUIRED ON RENDER) ================= */
// app.set("trust proxy", 1);

// /* ================= CORS (SAFE FOR EXPRESS 4 & 5) ================= */
// const allowedOrigins = [
//   "http://localhost:3000",
//   process.env.FRONTEND_URL, // e.g. https://skillwrap.vercel.app
// ].filter(Boolean);

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin) return callback(null, true); // allow server-to-server
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
// app.use(
//   session({
//     name: "skillwrap.sid",
//     secret: process.env.SESSION_SECRET || "defaultsecret",
//     resave: false,
//     saveUninitialized: false,
//     proxy: true,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 1000 * 60 * 60 * 24,
//     },
//   })
// );

// /* ================= PASSPORT ================= */
// app.use(passport.initialize());
// app.use(passport.session());

// /* ================= DEBUG (REMOVE AFTER CONFIRMATION) ================= */
// app.use((req, res, next) => {
//   console.log("SESSION:", req.session?.id);
//   console.log("USER:", req.user?.id);
//   next();
// });

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
//     credentials: true,
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   socket.on("register_user", (userId) => {
//     if (userId) socket.join(userId.toString());
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 Socket disconnected:", socket.id);
//   });
// });

// module.exports = { io };

// /* ================= START SERVER ================= */
// server.listen(port, () => {
//   console.log(`✅ API running on port ${port}`);
// });
