const passport = require("passport");
const db = require("../modules/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../config/mailer");
// const verifyemailController = require("../controller/verifyemailController");


const saltRounds = 10;

exports.authSignup = async (req, res) => {
  const { fullname, username, email, password } = req.body;
  const referredBy = req.query.ref || null;

  try {

    const existing = await db.query(
      "SELECT id FROM users WHERE email=$1 OR username=$2",
      [email, username]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success:false,
        error:"User already exists"
      });
    }

    const hash = await bcrypt.hash(password,10);

    // generate referral code
    const referralCode =
      username + Math.floor(1000 + Math.random()*9000);

    let referredUsername = null;

    if(referredBy){

      const refCheck = await db.query(
        "SELECT username FROM users WHERE referral_code=$1",
        [referredBy]
      );

      if(refCheck.rows.length === 0){
        return res.status(400).json({
          success:false,
          error:"Invalid referral code"
        });
      }

      referredUsername = refCheck.rows[0].username;

    }

    const result = await db.query(
      `INSERT INTO users
      (fullname, username, email, hash_password, email_verified, referred_by, referral_code)
      VALUES($1,$2,$3,$4,false,$5,$6)
      RETURNING id, email`,
      [fullname, username, email, hash, referredUsername, referralCode]
    );

    const user = result.rows[0];

    // reward points
    if(referredUsername){

      await db.query(
        "UPDATE users SET points = points + 50, xp = xp + 50  WHERE username=$1",
        [referredUsername]
      );

      await db.query(
        "UPDATE users SET points = points + 25, xp = xp + 25 WHERE id=$1",
        [user.id]
      );

    }

    return res.status(201).json({
      success:true,
      message:"Signup successful",
      email:user.email
    });

  } catch(err){
    console.error(err);
    res.status(500).json({
      success:false,
      error:"Server error"
    });
  }
};


exports.addPoints = async (req,res)=>{

  const { points } = req.body;
  const userId = req.user.id;


  try{

    await db.query(
      "UPDATE users SET points = points + $1 WHERE id=$2",
      [points, userId]
    );

    return res.json({
      success:true,
      message:`${points} points added`
    });

  }catch(err){

    console.error(err);

    return res.status(500).json({
      success:false,
      error:"Could not add points"
    });

  }

};

exports.GetLeaderBoard = async (req, res) =>{
  try {
    const result = await db.query(
`SELECT id, username, points, created_at
 FROM users
 ORDER BY points DESC
 LIMIT 20`
);


// console.log(result)
const response = result.rows

res.status(200).json({
  success: true,
  message: 'Fetched leaderboard sucessfully',
  LeaderBoard: response
})
  } catch (error) {
        console.error(error);

    return res.status(500).json({
      success:false,
      error:"Could not fetch leaderboard"
    });
  }
}

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

    // /* 🚫 BLOCK LOGIN IF EMAIL NOT VERIFIED */
    // if (user.email_verified = false) {
    //   return res.status(403).json({
    //     error: "EMAIL_NOT_VERIFIED",
    //     email: user.email,
    //   });
    // }

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



// function isAuthenticated(req, res, next) {
//     if(req.isAuthenticated())
//         return next();
//     res.redirect("/login");
// }
// exports.profile = [
//   isAuthenticated,
exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [req.user.id]
    );

    // id, email, username, fullname, mode, img_url, email_verified , created_at, bio, advice 

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
  };
// ];

exports.edit_profile = async (req, res) => {
  const userId = req.user.id
  const {username, fullname, email, bio} = req.body

try {
  await db.query(   
     `UPDATE users
       SET username=$1, fullname=$2, email=$3, bio=$4
       WHERE id=$5`,
       [username, fullname, email, bio, userId]
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


exports.sendUserBadges = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if(!user_id){
      return res.status(401).json({
        success:false,
        message:"Unauthorized"
      });
    }

    const result = await db.query(
      `
      SELECT
        badges.id,
        badges.name,
        badges.icon,
        user_badges.earned_at
      FROM user_badges
      JOIN badges
      ON badges.id = user_badges.badge_id
      WHERE user_badges.user_id = $1
      ORDER BY user_badges.earned_at DESC
      `,[user_id]
    );

    return res.status(200).json({
      success:true,
      badges: result.rows
    });
  } catch(error){
    console.error("FETCH USER BADGES ERROR:", error);

    return res.status(500).json({
      success:false,
      message:"Failed to fetch badges"
    });
  }
};

exports.forgotPassword = async (req, res) => {
  console.log("========== FORGOT PASSWORD ==========");

  try {
    const { email } = req.body;

    console.log("Incoming email:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find user
    const user = await db.query(
      `
      SELECT id, email, fullname
      FROM users
      WHERE email=$1
      `,
      [email]
    );


    // Don't reveal if email exists
    if (user.rows.length === 0) {

      return res.json({
        success: true,
        message:
          "If an account exists, a password reset link has been sent.",
      });

    }


    console.log("User found:", user.rows[0]);


    // Generate reset token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");


    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    // 15 minutes expiry
    const expires = Date.now() + 1000 * 60 * 15;


    await db.query(
      `
      UPDATE users
      SET 
      reset_password_token=$1,
      reset_password_expires=$2
      WHERE email=$3
      `,
      [
        hashedToken,
        expires,
        email
      ]
    );


    console.log("Reset token saved");


    const resetLink =
      `https://skillwrap2026.vercel.app/reset-password?token=${resetToken}`;



      // SEND EMAIL
try {


//   await sendEmail({
//   to: "juliegreat05@gmail.com",
//   subject: "Testing Gmail SMTP",
//   text: "Hello! This is a plain text email from SkillWrap.",
// });
  const emailResponse = await sendEmail({

    to: email,

    subject:
      "🔐 Reset Your SkillWrap Password",

    text: `
Hello ${user.rows[0].fullname || "User"},

We received a request to reset your SkillWrap password.

Click the link below to create a new password:

${resetLink}

This link expires in 15 minutes.

If you did not request this, you can ignore this email.

- SkillWrap Team
    `,


    html: `

    <div style="
      font-family:Arial,sans-serif;
      background:#020617;
      padding:40px;
      color:white;
    ">

      <div style="
        max-width:500px;
        margin:auto;
        background:#0f172a;
        padding:30px;
        border-radius:20px;
        border:1px solid #1e3a8a;
      ">


        <h1 style="color:#38bdf8;">
          SkillWrap Password Reset 🔐
        </h1>


        <p>
          Hello ${user.rows[0].fullname || "User"},
        </p>


        <p>
          We received a request to reset your password.
        </p>


        <a href="${resetLink}"
        style="
          display:inline-block;
          padding:14px 25px;
          background:#06b6d4;
          color:white;
          text-decoration:none;
          border-radius:10px;
          margin:20px 0;
        ">
          Reset Password
        </a>


        <p>
          This link expires in 15 minutes.
        </p>


        <p>
          If you did not request this, ignore this email.
        </p>


        <hr/>


        <small>
          © ${new Date().getFullYear()} SkillWrap
        </small>


      </div>

    </div>

    `
  });


  console.log(
    "✅ Password reset email sent successfully:",
    emailResponse
  );


} catch(emailError) {


  console.error(
    "❌ Failed to send password reset email:",
    emailError
  );


  return res.status(500).json({

    success:false,

    message:"Failed to send reset email"

  });

}

//     // SEND EMAIL
//     await sendEmail({

//       to: email,

//       subject:
//         "🔐 Reset Your SkillWrap Password",

//       text: `
// Hello ${user.rows[0].fullname || "User"},

// We received a request to reset your SkillWrap password.

// Click the link below to create a new password:

// ${resetLink}

// This link expires in 15 minutes.

// If you did not request this, you can ignore this email.

// - SkillWrap Team
//       `,


//       html: `

//       <div style="
//         font-family:Arial,sans-serif;
//         background:#020617;
//         padding:40px;
//         color:white;
//       ">

//         <div style="
//           max-width:500px;
//           margin:auto;
//           background:#0f172a;
//           padding:30px;
//           border-radius:20px;
//           border:1px solid #1e3a8a;
//         ">


//           <h1 style="color:#38bdf8;">
//             SkillWrap Password Reset 🔐
//           </h1>


//           <p>
//             Hello ${user.rows[0].fullname || "User"},
//           </p>


//           <p>
//             We received a request to reset your password.
//           </p>


//           <a href="${resetLink}"
//           style="
//             display:inline-block;
//             padding:14px 25px;
//             background:#06b6d4;
//             color:white;
//             text-decoration:none;
//             border-radius:10px;
//             margin:20px 0;
//           ">
//             Reset Password
//           </a>


//           <p>
//             This link expires in 15 minutes.
//           </p>


//           <p>
//             If you did not request this, ignore this email.
//           </p>


//           <hr/>


//           <small>
//             © ${new Date().getFullYear()} SkillWrap
//           </small>


//         </div>

//       </div>

//       `
//     });



    return res.json({

      success:true,

      message:
      "Password reset link sent successfully."

    });


  } catch(error){

    console.error("Forgot password error:", error);


    return res.status(500).json({

      success:false,

      message:"Server Error"

    });

  }
};

exports.resetPassword = async (req, res) => {
  console.log("========== RESET PASSWORD ==========");

  try {
    const {
      token,
      password,
      confirmPassword,
    } = req.body;

    console.log("Incoming data:", {
      token: token ? "Received" : "Missing",
      password: password ? "Received" : "Missing",
      confirmPassword: confirmPassword ? "Received" : "Missing",
    });

    // Validate token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    // Validate confirm password
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password is required.",
      });
    }

    // Passwords must match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    console.log("✅ Validation passed.");

    // Next step:
    // Hash token
    // Find user
    // Check expiry
    // Hash password
    // Update database

    return res.json({
      success: true,
      message: "Validation passed. Ready to reset password.",
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Missing token",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await db.query(
      `
      SELECT id
      FROM users
      WHERE
      reset_password_token=$1
      AND
      reset_password_expires > $2
      `,
      [
        hashedToken,
        Date.now(),
      ]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({
        success: false,
        expired: true,
        message: "Reset link has expired or is invalid.",
      });
    }

    return res.json({
      success: true,
      valid: true,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};