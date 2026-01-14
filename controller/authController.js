const passport = require("passport");
const db = require("../modules/db");
const bcrypt = require("bcrypt");
// const verifyemailController = require("../controller/verifyemailController");


const saltRounds = 10;


// post/signup
exports.authSignup = async (req, res) => {
  const { fullname, username, email, password } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email or username",
      });
    }

    // 2️⃣ Hash password
    const hash = await bcrypt.hash(password, 10);

    // 3️⃣ Create user as UNVERIFIED
    const result = await db.query(
      `
      INSERT INTO users (fullname, username, email, hash_password, verified)
      VALUES ($1, $2, $3, $4, false)
      RETURNING id, email
      `,
      [fullname, username, email, hash]
    );

    const user = result.rows[0];

    // 4️⃣ Send OTP email
    // await sendOtpVerificationEmail(user.id, user.email);

    // 5️⃣ Respond (NO SESSION)
    return res.status(201).json({
      success: true,
      message: "Signup successful. Please verify your email.",
      email: user.email,
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
};


// POST /auth/login
exports.authLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("❌ Passport error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (!user) {
      return res.status(401).json({
        error: "Invalid email/username or password",
      });
    }

    /* 🚫 BLOCK LOGIN IF EMAIL NOT VERIFIED */
    if (!user.email_verified) {
      return res.status(403).json({
        error: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("❌ req.login error:", err);
        return res.status(500).json({ error: "Login failed" });
      }

      return res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
        },
      });
    });
  })(req, res, next);
};


// /api/dashboard
exports.dashboard = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const result = await db.query(
      "SELECT COUNT(*) FROM skills WHERE user_id = $1",
      [req.user.id]
    );
    const bookCount = result.rows[0].count;

    res.json({
      success: true,
      user: req.user,
      bookCount,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
};



function isAuthenticated(req, res, next) {
    if(req.isAuthenticated())
        return next();
    res.redirect("/login");
}

exports.profile = [
  isAuthenticated,
exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const result = await db.query(
      "SELECT id, fullname, username, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({
      success: false,
      error: "Something went wrong.",
    });
    }
  }
];

exports.edit_profile = async (req, res) => {
  const userId = req.user.id
  const {username, fullname, email} = req.body

try {
  await db.query(   
     `UPDATE users
       SET username=$1, fullname=$2, email=$3
       WHERE id=$4`,
       [username, fullname, email, userId]
      )

      res.json({
        success: true,
        message: "updated succesfully"
      });
} catch (error) {
  console.error("edit-Profile error:", error);
  res.status(500).json({ success: false, error: "Failed to updated profile." });  
}
}



// POST /api/logout
exports.logout = (req, res) => {
req.logout(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy(() => {
      res.clearCookie("skillwrap.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      res.status(200).json({ success: true });
    })
  })
};
