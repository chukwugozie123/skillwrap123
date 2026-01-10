// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const db = require("../modules/db")
// const bcrypt = require("bcrypt");

// // ----- LOCAL STRATEGY (email or username + password) -----
// passport.use(
//   new LocalStrategy(
//     { usernameField: "emailOrUsername", passwordField: "password" },
//     async (emailOrUsername, password, cb) => {
//       try {
//         const result = await db.query(
//           "SELECT * FROM users WHERE email = $1 OR username = $1",
//           [emailOrUsername]
//         );

//         if (result.rows.length === 0) {
//           return cb(null, false, { message: "User not found" });
//         }

//         const user = result.rows[0];

//         bcrypt.compare(password, user.hash_password, (err, isMatch) => {
//           if (err) return cb(err);

//           if (isMatch) {
//             return cb(null, user);
//           } else {
//             return cb(null, false, { message: "Incorrect password" });
//           }
//         });
//       } catch (error) {
//         console.error("Login error:", error);
//         return cb(error);
//       }
//     }
//   )
// );


// // ----- GOOGLE STRATEGY -----
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/profile",
//       userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
//     },
//     async (accessToken, refreshToken, profile, cb) => {
//       try {
//         const email = profile.emails[0].value;
//         const fullname = profile.displayName;
//         const username = profile.displayName.replace(/\s+/g, "").toLowerCase(); // auto-username
//         const photo = profile.photos?.[0]?.value || null;

//         // Check if user exists
//         const result = await db.query("SELECT * FROM users WHERE email = $1", [
//           email,
//         ]);

//         if (result.rows.length === 0) {
//           // Create new user with photo
//           const insert = await db.query(
//             `INSERT INTO users (fullname, username, email, hash_password, img_url) 
//              VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//             [fullname, username, email, "google-oauth", photo]
//           );

//           cb(null, insert.rows[0]);
//         } else {
//           // Update photo if missing/changed
//           const existingUser = result.rows[0];
//           if (!existingUser.photo || existingUser.photo !== photo) {
//             const update = await db.query(
//               `UPDATE users SET photo = $1 WHERE id = $2 RETURNING *`,
//               [photo, existingUser.id]
//             );
//             return cb(null, update.rows[0]);
//           }

//           cb(null, existingUser);
//         }
//       } catch (error) {
//         console.error("Google auth error:", error);
//         cb(error, null);
//       }
//     }
//   )
// );


// // ----- SESSION SERIALIZE -----
// passport.serializeUser((user, cb) => {
//   cb(null, user.id); // store only id in session
// });

// passport.deserializeUser(async (id, cb) => {
//   try {
//     const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
//     cb(null, result.rows[0]);
//   } catch (err) {
//     cb(err, null);
//   }
// });
























const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const db = require("../modules/db");

/* ================= LOCAL STRATEGY ================= */

passport.use(
  new LocalStrategy(
    { usernameField: "emailOrUsername", passwordField: "password" },
    async (emailOrUsername, password, done) => {
      try {
        const result = await db.query(
          "SELECT * FROM users WHERE email = $1 OR username = $1",
          [emailOrUsername]
        );

        if (result.rows.length === 0) {
          console.log("❌ No user found");
          return done(null, false, { message: "No user found" });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.hash_password);
        if (!match) {
          console.log("❌ Incorrect password");
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* ================= GOOGLE STRATEGY ================= */

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ✅ MUST POINT TO BACKEND (Render), NOT FRONTEND
      callbackURL: "https://skillwrap-backend.onrender.com/auth/google/callback",

      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fullname = profile.displayName;
        const username = fullname.replace(/\s+/g, "").toLowerCase();
        const photo = profile.photos?.[0]?.value || null;

        if (!email) {
          return cb(new Error("Google account has no email"), null);
        }

        const result = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        // 🆕 CREATE USER
        if (result.rows.length === 0) {
          const insert = await db.query(
            `
            INSERT INTO users 
            (fullname, username, email, hash_password, img_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [fullname, username, email, "google-oauth", photo]
          );

          return cb(null, insert.rows[0]);
        }

        // ♻️ EXISTING USER
        const existingUser = result.rows[0];

        // ✅ FIXED: img_url (NOT photo)
        if (photo && existingUser.img_url !== photo) {
          const update = await db.query(
            `
            UPDATE users 
            SET img_url = $1 
            WHERE id = $2 
            RETURNING *
            `,
            [photo, existingUser.id]
          );

          return cb(null, update.rows[0]);
        }

        return cb(null, existingUser);
      } catch (error) {
        console.error("Google auth error:", error);
        cb(error, null);
      }
    }
  )
);

/* ================= SESSION ================= */

passport.serializeUser((user, done) => {
  console.log("🔐 Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔓 Deserializing user id:", id);

    const result = await db.query(
      "SELECT id, fullname, username, email, img_url FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      console.log("❌ No user found in deserialize");
      return done(null, false);
    }

    console.log("✅ Deserialized user:", result.rows[0]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;























































// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const bcrypt = require("bcrypt");
// const db = require("../modules/db"); // adjust path if needed

// // ✅ Local Strategy (email or username)
// passport.use(
//   new LocalStrategy(
//     { usernameField: "emailOrUsername", passwordField: "password" },
//     async (emailOrUsername, password, done) => {
//       try {
//         const result = await db.query(
//           "SELECT * FROM users WHERE email = $1 OR username = $1",
//           [emailOrUsername]
//         );

//         if (result.rows.length === 0) {
//           console.log("❌ No user found");
//           return done(null, false, { message: "No user found" });
//         }

//         const user = result.rows[0];
//         const match = await bcrypt.compare(password, user.hash_password);

//         if (!match) {
//           console.log("❌ Incorrect password");
//           return done(null, false, { message: "Incorrect password" });
//         }

//         console.log("✅ User authenticated:", user.username);
//         return done(null, user);
//       } catch (err) {
//         console.error("❌ Auth error:", err);
//         return done(err);
//       }
//     }
//   )
// );

// // ✅ (Optional) Google OAuth strategy setup — only if you plan to use it later
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID || "dummy",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
//       callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails[0].value;
//         const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
//         let user;

//         if (result.rows.length > 0) {
//           user = result.rows[0];
//         } else {
//           const insert = await db.query(
//             "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
//             [profile.displayName, email]
//           );
//           user = insert.rows[0];
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // ✅ Serialize user → stores ID in session
// passport.serializeUser((user, done) => {
//   console.log("🧩 Serializing user:", user.id );
//   done(null, user.id);
// });

// // ✅ Deserialize user → restores full user from DB
// passport.deserializeUser(async (id, done) => {
//   try {
//     const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
//     const user = result.rows[0];
//     console.log("🔁 Deserialized user:", user);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

// module.exports = passport;
