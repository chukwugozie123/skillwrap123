// const db = require("../modules/db");

// exports.checkAchievements = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { action } = req.body;

//     let achievement = null;
//     let points = 0;

//     // --------------------------
//     // SKILL CREATED
//     // --------------------------

//     if (action === "skill_created") {

//       const skillCountRes = await db.query(
//         "SELECT COUNT(*) FROM skills WHERE user_id = $1",
//         [userId]
//       );

//       const count = Number(skillCountRes.rows[0].count);

//       if (count === 1) {
//         achievement = "First Skill Created";
//         points = 20;
//       }

//       if (count === 10) {
//         achievement = "10 Skills Uploaded";
//         points = 100;
//       }
//     }

//     // --------------------------
//     // REQUEST SENT
//     // --------------------------

//     if (action === "request_sent") {

//       const reqCountRes = await db.query(
//         "SELECT COUNT(*) FROM exchange_skills WHERE from_user_id = $1",
//         [userId]
//       );

//       const count = Number(reqCountRes.rows[0].count);

//       if (count === 1) {
//         achievement = "First Request Sent";
//         points = 5;
//       }
//     }

//     // --------------------------
//     // EXCHANGE COMPLETED
//     // --------------------------

//     if (action === "exchange_completed") {

//       const exchangeCountRes = await db.query(
//         `SELECT COUNT(*) 
//          FROM exchange_skills
//          WHERE user_id = $1 AND exchange_status='completed'`,
//         [userId]
//       );

//       const count = Number(exchangeCountRes.rows[0].count);

//       if (count === 1) {
//         achievement = "First Exchange Completed";
//         points = 40;
//       }

//       if (count === 10) {
//         achievement = "10 Exchanges Completed";
//         points = 150;
//       }

//       if (count === 20) {
//         achievement = "20 Exchanges Completed";
//         points = 300;
//       }
//     }

//     // --------------------------
//     // ADD POINTS
//     // --------------------------

//     if (points > 0) {

//       await db.query(
//         `UPDATE users
//          SET points = points + $1
//          WHERE id = $2`,
//         [points, userId]
//       );

//       console.log(achievement, points, 'checking last result')

//       return res.json({
//         success: true,
//         achievement,
//         points
//       });
//     }

//     return res.json({
//       success: false
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Achievement check failed" });
//   }
// };
































const db = require("../modules/db");

exports.checkAchievements = async (req, res) => {
  try {

    console.log("========== ACHIEVEMENT CHECK START ==========");

    const userId = req.user?.id;
    const { action } = req.body;

    console.log("User ID:", userId);
    console.log("Action received:", action);

    let achievement = null;
    let points = 0;

    // --------------------------
    // SKILL CREATED
    // --------------------------

    if (action === "skill_created") {

      console.log("Checking skill achievements...");

      const skillCountRes = await db.query(
        "SELECT COUNT(*) FROM skills WHERE user_id = $1",
        [userId]
      );

      console.log("Skill query result:", skillCountRes.rows);

      const count = Number(skillCountRes.rows[0].count);

      console.log("Skill count:", count);

      if (count === 1) {
        achievement = "First Skill Created";
        points = 20;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 10) {
        achievement = "10 Skills Uploaded";
        points = 100;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 50) {
        achievement = "50 Skills Uploaded";
        points = 500;
        console.log("Achievement unlocked:", achievement);
      }
    }

    // --------------------------
    // REQUEST SENT
    // --------------------------

    if (action === "request_sent") {

      console.log("Checking request achievements...");

      const reqCountRes = await db.query(
        "SELECT COUNT(*) FROM exchange_skills WHERE from_user_id = $1",
        [userId]
      );

      console.log("Request query result:", reqCountRes.rows);

      const count = Number(reqCountRes.rows[0].count);

      console.log("Request count:", count);

      if (count === 1) {
        achievement = "First Request Sent";
        points = 5;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 15) {
        achievement = "15 Request sent";
        points = 15;
        console.log("Achievement unlocked:", achievement);
      }
    }

    // --------------------------
    // EXCHANGE COMPLETED
    // --------------------------

    if (action === "exchange_completed") {

      console.log("Checking exchange achievements...");

      const exchangeCountRes = await db.query(
        `SELECT COUNT(*) 
         FROM exchange_skills
         WHERE from_user_id = $1 AND exchange_status='completed'`,
        [userId]
      );

      console.log("Exchange query result:", exchangeCountRes.rows);

      const count = Number(exchangeCountRes.rows[0].count);

      console.log("Exchange count:", count);

      if (count === 1) {
        achievement = "First Exchange Completed";
        points = 40;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 10) {
        achievement = "10 Exchanges Completed";
        points = 150;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 20) {
        achievement = "20 Exchanges Completed";
        points = 300;
        console.log("Achievement unlocked:", achievement);
      }
    }

    // --------------------------
    // ADD POINTS
    // --------------------------

    if (points > 0) {

      console.log("Adding points to user...");
      console.log("Points:", points);

      await db.query(
        `UPDATE users
         SET points = points + $1
         WHERE id = $2`,
        [points, userId]
      );

      console.log("Points successfully added");

      console.log("Final achievement result:", {
        achievement,
        points
      });

      console.log("========== ACHIEVEMENT SUCCESS ==========");

      return res.json({
        success: true,
        achievement,
        points
      });
    }

    console.log("No achievement unlocked");
    console.log("========== ACHIEVEMENT END ==========");

    return res.json({
      success: false
    });

  } catch (err) {

    console.log("========== ACHIEVEMENT ERROR ==========");
    console.error("Error:", err);
    console.log("Request body:", req.body);
    console.log("User object:", req.user);
    console.log("========== END ERROR ==========");

    res.status(500).json({ error: "Achievement check failed" });
  }
};
