// const express = require("express");
// const session = require("express-session");
// const cors = require("cors");
// const passport = require("passport");
// const { Server } = require("socket.io");
// const http = require("http");
// require("dotenv").config();
// require("./config/passport");

// const authRoutes = require("./routes/authRoutes");
// const skillRoutes = require("./routes/skillRoutes");
// const exchangeRoutes = require("./routes/exchangeRoutes");
// const uploadRoute = require("./routes/uploadRoutes");
// const notificationRoute = require("./routes/notifiacationRoute"); // corrected filename
// const reviewRoute = require("./routes/reviewRoute")
// const profileRoute = require("./routes/profileRoute")

// const app = express();
// const port = process.env.PORT || 5000;

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000", methods: ["GET","POST"], credentials: true },
//   transports: ["websocket", "polling"]
// });

// // export io so controllers can use it
// module.exports = { io }


// // Middleware
// app.use("/uploads", express.static("uploads"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   })
// );

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "defaultsecret",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// // Routes
// app.use("/auth", authRoutes);
// app.use("/", skillRoutes);
// app.use("/", exchangeRoutes);
// app.use("/", uploadRoute);
// app.use("/", reviewRoute);
// app.use("/", profileRoute);
// app.use("/", notificationRoute); // corrected

// // socket setup
// io.on("connection", (socket) => {
//   console.log("socket connected", socket.id);

//   // client should emit 'register_user' with their userId (string or number)
//   socket.on("register_user", (userId) => {
//     if (!userId) return;
//     const room = userId.toString();
//     socket.join(room);
//     console.log(`👤 user ${room} joined room`);
//   });

//   socket.on("disconnect", () => {
//     console.log(`🔴 User disconnected: ${socket.id}`);
//   });
// });

// // IMPORTANT: listen on `server` (not app) because we attached socket.io to the server
// server.listen(port, () => {
//   console.log(`✅ API server running at http://localhost:${port}`);
// });




// const express = require("express");
// const session = require("express-session");
// const cors = require("cors");
// const passport = require("passport");
// const { Server } = require("socket.io");
// const http = require("http");
// require("dotenv").config();
// require("./config/passport");

// const authRoutes = require("./routes/authRoutes");
// const skillRoutes = require("./routes/skillRoutes");
// const exchangeRoutes = require("./routes/exchangeRoutes");
// const uploadRoute = require("./routes/uploadRoutes");
// const notificationRoute = require("./routes/notifiacationRoute"); // corrected filename
// const reviewRoute = require("./routes/reviewRoute");
// const profileRoute = require("./routes/profileRoute");

// const app = express();
// const port = process.env.PORT || 5000;

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { 
//     origin: [ "http://localhost:3000", process.env.FRONTEND_URL ].filter(Boolean),
//     methods: ["GET","POST"],
//     credentials: true,
//     transports: ["websocket", "polling"]
//   }
// });
// console.log(process.env.FRONTEND_URL, 'ss')

// // export io for controllers
// module.exports = { io };

// // Middleware
// app.use("/uploads", express.static("uploads"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const allowedOrigins = ["http://localhost:3000"];
// if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (Postman, server-to-server)
//       if (!origin) return callback(null, true);
//       if (!allowedOrigins.includes(origin)) {
//         return callback(new Error("CORS not allowed for this origin"), false);
//       }
//       return callback(null, true);
//     },
//     credentials: true
//   })
// );

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "defaultsecret",
//     resave: false,
//     saveUninitialized: false
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// // Routes
// app.use("/auth", authRoutes);
// app.use("/", skillRoutes);
// app.use("/", exchangeRoutes);
// app.use("/", uploadRoute);
// app.use("/", reviewRoute);
// app.use("/", profileRoute);
// app.use("/", notificationRoute);

// // Socket.io
// io.on("connection", (socket) => {
//   console.log("socket connected", socket.id);

//   socket.on("register_user", (userId) => {
//     if (!userId) return;
//     const room = userId.toString();
//     socket.join(room);
//     console.log(`👤 user ${room} joined room`);
//   });

//   socket.on("disconnect", () => {
//     console.log(`🔴 User disconnected: ${socket.id}`);
//   });
// });

// // Start server
// server.listen(port, () => {
//   console.log(`✅ API server running at http://localhost:${port}`);
// });










const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
require("./config/passport"); // passport config

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const exchangeRoutes = require("./routes/exchangeRoutes");
const uploadRoute = require("./routes/uploadRoutes");
const notificationRoute = require("./routes/notifiacationRoute");
const reviewRoute = require("./routes/reviewRoute");
const profileRoute = require("./routes/profileRoute");

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  },
});

module.exports = { io };

/* ================= MIDDLEWARE ================= */
app.set("trust proxy", 1); // REQUIRED on Render

app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ["http://localhost:3000"];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS blocked"), false);
      }
      callback(null, true);
    },
    credentials: true,
  })
);

/* ================= SESSION ================= */
app.use(
  session({
    name: "skillwrap.sid",
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
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

/* DEBUG (REMOVE LATER) */
app.use((req, res, next) => {
  console.log("SESSION:", req.session);
  console.log("USER:", req.user);
  next();
});

/* ================= ROUTES ================= */
app.use("/auth", authRoutes);
app.use("/", skillRoutes);
app.use("/", exchangeRoutes);
app.use("/", uploadRoute);
app.use("/", reviewRoute);
app.use("/", profileRoute);
app.use("/", notificationRoute);

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("register_user", (userId) => {
    if (!userId) return;
    socket.join(userId.toString());
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* ================= START ================= */
server.listen(port, () => {
  console.log(`✅ API running on http://localhost:${port}`);
});
