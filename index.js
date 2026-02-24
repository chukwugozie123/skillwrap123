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

require("./config/passport"); // Passport config

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
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
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

/* ================= SOCKET EVENTS ================= */
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  /* ================= ENTER PRIVATE ROOM ================= */
  socket.on("enterRoom", async ({ roomId, userId }) => {
    try {

      console.log(roomId, userId, 'checking something')


      if (!roomId || !userId) return;

      /* 1️⃣ Check if room exists */
      const roomRes = await pool.query(
        "SELECT * FROM rooms WHERE exchange_id = $1",
        [roomId]
      );

      if (roomRes.rows.length === 0) {
        console.log("❌ Room not found");
        return;
      }

      const room = roomRes.rows[0];

      /* 2️⃣ Verify user belongs to the exchange */
      const exchangeRes = await pool.query(
        `SELECT * FROM exchange_skills
         WHERE id = $1`,
        [roomId]
      );

      if (exchangeRes.rows.length === 0) {
        console.log("❌ Unauthorized access attempt");
        return;
      }

      const socketRoom = `room_001${room.id}`;

      /* 3️⃣ Join socket room */
      socket.join(socketRoom);

      /* 4️⃣ Track active user */
      activeUsers.push({
        socketId: socket.id,
        userId,
        roomId: room.id,
        socketRoom,
      });

      /* 5️⃣ Get username */
      const userRes = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [userId]
      );

      const username = userRes.rows[0].username;

      /* 6️⃣ System welcome */
      socket.emit("message", {
        text: "Welcome to your exchange chat",
        username: "System",
        created_at: new Date(),
      });

      socket.to(socketRoom).emit("message", {
        text: `${username} joined the chat`,
        username: "System",
        created_at: new Date(),
      });

      /* 7️⃣ Load previous messages */
      const messagesRes = await pool.query(
        `SELECT messages.id,
                messages.text,
                messages.created_at,
                users.username
         FROM messages
         JOIN users ON users.id = messages.sender_id
         WHERE room_id = $1
         ORDER BY messages.created_at ASC`,
        [room.id]
      );

      socket.emit("previousMessages", messagesRes.rows);

      /* 8️⃣ Send active users in room */
      const usersInRoom = activeUsers.filter(u => u.roomId === room.id);

      const usersWithNames = await Promise.all(
        usersInRoom.map(async (u) => {
          const res = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [u.userId]
          );
          return res.rows[0].username;
        })
      );

      io.to(socketRoom).emit("roomUsers", {
        users: usersWithNames,
        count: usersWithNames.length,
      });

    } catch (err) {
      console.error("EnterRoom Error:", err);
    }
  });

  /* ================= SEND MESSAGE ================= */
  socket.on("message", async ({ text }) => {
    try {
      const user = getUser(socket.id);
      if (!user || !text) return;

      const msgRes = await pool.query(
        `INSERT INTO messages (room_id, sender_id, text)
         VALUES ($1, $2, $3) RETURNING *`,
        [user.roomId, user.userId, text]
      );

      const userRes = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [user.userId]
      );

      const username = userRes.rows[0].username;

      io.to(user.socketRoom).emit("message", {
        id: msgRes.rows[0].id,
        text: msgRes.rows[0].text,
        username,
        created_at: msgRes.rows[0].created_at,
      });

    } catch (err) {
      console.error("Message Error:", err);
    }
  });

  /* ================= TYPING ================= */
  socket.on("typing", ({ name }) => {
    const user = getUser(socket.id);
    if (!user) return;
    socket.to(user.socketRoom).emit("typing", { name });
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", async () => {
    try {
      const user = getUser(socket.id);
      if (!user) return;

      removeUser(socket.id);

      const userRes = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [user.userId]
      );

      const leavingUsername = userRes.rows[0].username;

      io.to(user.socketRoom).emit("message", {
        text: `${leavingUsername} left the chat`,
        username: "System",
        created_at: new Date(),
      });

      const usersInRoom = activeUsers.filter(u => u.roomId === user.roomId);

      const usersWithNames = await Promise.all(
        usersInRoom.map(async (u) => {
          const res = await pool.query(
            "SELECT username FROM users WHERE id = $1",
            [u.userId]
          );
          return res.rows[0].username;
        })
      );

      io.to(user.socketRoom).emit("roomUsers", {
        users: usersWithNames,
        count: usersWithNames.length,
      });

    } catch (err) {
      console.error("Disconnect Error:", err);
    }
  });

});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
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





























// /* ================= SOCKET STATE ================= */
// let activeUsers = [];

// function getUser(socketId) {
//   return activeUsers.find(u => u.socketId === socketId);
// }

// function removeUser(socketId) {
//   activeUsers = activeUsers.filter(u => u.socketId !== socketId);
// }


//  ================= SOCKET EVENTS ================= */
// io.on("connection", (socket) => {
//   console.log("✅ Socket connected:", socket.id);

//   // Join a room
//   socket.on("enterRoom", async ({ roomName, userId }) => {
//     try {
//       if (!roomName || !userId) return;

//       // Get or create room
//       let roomRes = await pool.query("SELECT * FROM rooms WHERE name = $1", [roomName]);
//       let room;
//       if (roomRes.rows.length === 0) {
//         const newRoom = await pool.query("INSERT INTO rooms (name) VALUES ($1) RETURNING *", [roomName]);
//         room = newRoom.rows[0];
//       } else {
//         room = roomRes.rows[0];
//       }

//       // Join socket room
//       socket.join(room.name);

//       // Track active user
//       activeUsers.push({
//         socketId: socket.id,
//         userId,
//         roomId: room.id,
//         roomName: room.name,
//       });

//       // Get username of joining user
//       const joiningUserRes = await pool.query(
//         "SELECT username FROM users WHERE id = $1",
//         [userId]
//       );
//       const joiningUsername = joiningUserRes.rows[0].username;

//       // Welcome message to joining user
//       socket.emit("message", {
//         text: `Welcome to ${room.name}`,
//         username: "System",
//         created_at: new Date(),
//       });

//       // Notify others in room
//       socket.to(room.name).emit("message", {
//         text: `${joiningUsername} joined ${room.name}`,
//         username: "System",
//         created_at: new Date(),
//       });

//       // Send updated user list to room
//       const usersInRoom = activeUsers.filter(u => u.roomName === room.name);
//       const usersWithNames = await Promise.all(
//         usersInRoom.map(async (u) => {
//           const res = await pool.query("SELECT username FROM users WHERE id = $1", [u.userId]);
//           return res.rows[0].username;
//         })
//       );

//       io.to(room.name).emit("roomUsers", {
//         users: usersWithNames,
//         count: usersWithNames.length,
//       });

//       // Save membership
//       await pool.query(
//         `INSERT INTO room_members (room_id, user_id)
//          VALUES ($1, $2)
//          ON CONFLICT (room_id, user_id) DO NOTHING`,
//         [room.id, userId]
//       );

//       // Load last 100 messages
//       const messagesRes = await pool.query(
//         `SELECT messages.id, messages.text, messages.created_at, users.username
//          FROM messages
//          JOIN users ON users.id = messages.sender_id
//          WHERE room_id = $1
//          ORDER BY created_at ASC
//          LIMIT 100`,
//         [room.id]
//       );

//       socket.emit("previousMessages", messagesRes.rows);

//     } catch (err) {
//       console.error("EnterRoom Error:", err);
//     }
//   });

//   // Send message
//   socket.on("message", async ({ text }) => {
//     try {
//       const user = getUser(socket.id);
//       if (!user || !text) return;

//       // Save message
//       const msgRes = await pool.query(
//         `INSERT INTO messages (room_id, sender_id, text)
//          VALUES ($1, $2, $3) RETURNING *`,
//         [user.roomId, user.userId, text]
//       );

//       // Get username
//       const userRes = await pool.query("SELECT username FROM users WHERE id = $1", [user.userId]);
//       const username = userRes.rows[0].username;

//       // Emit to room
//       io.to(user.roomName).emit("message", {
//         id: msgRes.rows[0].id,
//         text: msgRes.rows[0].text,
//         username,
//         created_at: msgRes.rows[0].created_at,
//       });

//     } catch (err) {
//       console.error("Message Error:", err);
//     }
//   });

//   // Typing indicator
//   socket.on("typing", ({ name }) => {
//     const user = getUser(socket.id);
//     if (!user) return;
//     socket.to(user.roomName).emit("typing", { name });
//   });

//   // Disconnect
//   socket.on("disconnect", async () => {
//     const user = getUser(socket.id);
//     if (user) {
//       removeUser(socket.id);

//       const usersInRoom = activeUsers.filter(u => u.roomName === user.roomName);
//       const usersWithNames = await Promise.all(
//         usersInRoom.map(async (u) => {
//           const res = await pool.query("SELECT username FROM users WHERE id = $1", [u.userId]);
//           return res.rows[0].username;
//         })
//       );

//       // Get leaving username
//       const userRes = await pool.query("SELECT username FROM users WHERE id = $1", [user.userId]);
//       const leavingUsername = userRes.rows[0].username;

//       // Notify room
//       io.to(user.roomName).emit("message", {
//         text: `${leavingUsername} left ${user.roomName}`,
//         username: "System",
//         created_at: new Date(),
//       });

//       // Update room user list
//       io.to(user.roomName).emit("roomUsers", {
//         users: usersWithNames,
//         count: usersWithNames.length,
//       });
//     }
//   });
// });