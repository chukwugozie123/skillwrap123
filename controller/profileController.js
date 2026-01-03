// const db = require("../modules/db");

// /**
//  * GET USER PROFILE SUMMARY
//  * /profile/:userId
//  */
// exports.getUserProfile = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     /* ===============================
//        1️⃣ BASIC USER INFO
//     =============================== */
//     const userQuery = `
//       SELECT 
//         id,
//         username,
//         fullname,
//         email,
//         avatar,
//         created_at
//       FROM users
//       WHERE id = $1
//     `;
//     const userResult = await db.query(userQuery, [userId]);

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = userResult.rows[0];

//     /* ===============================
//        2️⃣ TOTAL SKILLS
//     =============================== */
//     const skillsQuery = `
//       SELECT COUNT(*) AS total_skills
//       FROM skills
//       WHERE user_id = $1
//     `;
//     const skillsResult = await db.query(skillsQuery, [userId]);

//     /* ===============================
//        3️⃣ SUCCESSFUL EXCHANGES
//        (accepted exchanges involving user)
//     =============================== */
//     const exchangeQuery = `
//       SELECT COUNT(*) AS successful_exchanges
//       FROM exchange_skills
//       WHERE status = 'accepted'
//       AND (from_user_id = $1 OR to_user_id = $1)
//     `;
//     const exchangeResult = await db.query(exchangeQuery, [userId]);

//     /* ===============================
//        4️⃣ REVIEWS SUMMARY
//     =============================== */
//     const reviewsQuery = `
//       SELECT 
//         COUNT(*) AS total_reviews,
//         COALESCE(AVG(rating), 0) AS average_rating
//       FROM reviews
//       WHERE to_user_id = $1
//     `;
//     const reviewsResult = await db.query(reviewsQuery, [userId]);

//     /* ===============================
//        5️⃣ RESPONSE
//     =============================== */
//     res.status(200).json({
//       success: true,
//       profile: {
//         id: user.id,
//         username: user.username,
//         fullname: user.fullname,
//         email: user.email,
//         avatar: user.avatar,
//         joined_at: user.created_at,

//         stats: {
//           total_skills: Number(skillsResult.rows[0].total_skills),
//           successful_exchanges: Number(exchangeResult.rows[0].successful_exchanges),
//           total_reviews: Number(reviewsResult.rows[0].total_reviews),
//           average_rating: Number(reviewsResult.rows[0].average_rating).toFixed(1),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("❌ Profile fetch error:", error);
//     res.status(500).json({ message: "Failed to load profile" });
//   }
// };
// const db = require("../modules/db");

// /**
//  * GET USER PROFILE SUMMARY
//  * /profile/:userId
//  */
// exports.getUserProfile = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     /* ===============================
//        1️⃣ BASIC USER INFO
//     =============================== */
//     const userQuery = `
//       SELECT 
//         id,
//         username,
//         fullname,
//         email,
//         avatar,
//         created_at
//       FROM users
//       WHERE id = $1
//     `;
//     const userResult = await db.query(userQuery, [userId]);

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = userResult.rows[0];

//     /* ===============================
//        2️⃣ TOTAL SKILLS
//     =============================== */
//     const skillsQuery = `
//       SELECT COUNT(*) AS total_skills
//       FROM skills
//       WHERE user_id = $1
//     `;
//     const skillsResult = await db.query(skillsQuery, [userId]);

//     /* ===============================
//        3️⃣ SUCCESSFUL EXCHANGES
//        (accepted exchanges involving user)
//     =============================== */
//     const exchangeQuery = `
//       SELECT COUNT(*) AS successful_exchanges
//       FROM exchange_skills
//       WHERE status = 'accepted'
//       AND (from_user_id = $1 OR to_user_id = $1)
//     `;
//     const exchangeResult = await db.query(exchangeQuery, [userId]);

//     /* ===============================
//        4️⃣ REVIEWS SUMMARY
//     =============================== */
//     const reviewsQuery = `
//       SELECT 
//         COUNT(*) AS total_reviews,
//         COALESCE(AVG(rating), 0) AS average_rating
//       FROM reviews
//       WHERE to_user_id = $1
//     `;
//     const reviewsResult = await db.query(reviewsQuery, [userId]);

//     /* ===============================
//        5️⃣ RESPONSE
//     =============================== */
//     res.status(200).json({
//       success: true,
//       profile: {
//         id: user.id,
//         username: user.username,
//         fullname: user.fullname,
//         email: user.email,
//         avatar: user.avatar,
//         joined_at: user.created_at,

//         stats: {
//           total_skills: Number(skillsResult.rows[0].total_skills),
//           successful_exchanges: Number(exchangeResult.rows[0].successful_exchanges),
//           total_reviews: Number(reviewsResult.rows[0].total_reviews),
//           average_rating: Number(reviewsResult.rows[0].average_rating).toFixed(1),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("❌ Profile fetch error:", error);
//     res.status(500).json({ message: "Failed to load profile" });
//   }
// };















// const db = require("../modules/db")

//  exports.getUserProfile = async (req, res) => {
//   const { username } = req.params;

//   try {
//     /* 1️⃣ User profile */
//     const userResult = await db.query(
//       `
//       SELECT id, fullname, username, img_url, created_at
//       FROM users
//       WHERE id = $1
//       `,
//       [username]
//     );

//     if (!userResult.rows.length) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = userResult.rows[0];

//     /* 2️⃣ Successful exchanges */
//     const exchangeResult = await db.query(
//       `
//       SELECT COUNT(*)::int AS successful_exchanges
//       FROM exchange_skills
//       WHERE exchange_status = 'completed'
//       AND ($1 = from_user_id OR $1 = to_user_id)
//       `,
//       [user.id]
//     );

//     /* 3️⃣ Skills + avg ratings */
//     const skillsResult = await db.query(
//       `
//       SELECT
//         s.id AS skill_id,
//         s.title,
//         s.description,
//         s.level,
//         s.category,
//         s.created_at,
//         COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
//         COUNT(r.id)::int AS review_count
//       FROM skills s
//       LEFT JOIN reviews r
//         ON r.skill_offered_id = s.id
//         OR r.skill_requested_id = s.id
//       WHERE s.user_id = $1
//       GROUP BY s.id
//       ORDER BY s.created_at DESC
//       `,
//       [user.id]
//     );

//     /* 4️⃣ Reviews per skill */
//     const skillsWithReviews = await Promise.all(
//       skillsResult.rows.map(async (skill) => {
//         const reviews = await db.query(
//           `
//           SELECT
//             r.id,
//             r.rating,
//             r.review_text,
//             r.created_at,
//             u.username AS reviewer_username,
//             u.img_url AS reviewer_avatar
//           FROM reviews r
//           JOIN users u ON u.id = r.from_user_id
//           WHERE r.skill_offered_id = $1
//              OR r.skill_requested_id = $1
//           ORDER BY r.created_at DESC
//           `,
//           [skill.skill_id]
//         );

//         return {
//           ...skill,
//           reviews: reviews.rows,
//         };
//       })
//     );

//     /* 5️⃣ Overall rating */
//     const overallRatingResult = await db.query(
//       `
//       SELECT 
//         COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS overall_rating,
//         COUNT(*)::int AS total_reviews
//       FROM reviews
//       WHERE to_user_id = $1
//       `,
//       [user.id]
//     );

//     res.json({
//       profile: user,
//       stats: {
//         successful_exchanges: exchangeResult.rows[0].successful_exchanges,
//         overall_rating: overallRatingResult.rows[0].overall_rating,
//         total_reviews: overallRatingResult.rows[0].total_reviews,
//       },
//       skills: skillsWithReviews,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // seee when ur fetching the skills ehee fetch the user_id the id of the perso thay has the skill u get in the sql query 












const db = require("../modules/db");

exports.getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    /* 1️⃣ User profile (FIXED) */
    const userResult = await db.query(
      `
      SELECT id, fullname, username, img_url, created_at
      FROM users
      WHERE username = $1
      `,
      [username]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    /* 2️⃣ Successful exchanges */
    const exchangeResult = await db.query(
      `
      SELECT COUNT(*)::int AS successful_exchanges
      FROM exchange_skills
      WHERE exchange_status = 'completed'
        AND ($1 = from_user_id OR $1 = to_user_id)
      `,
      [user.id]
    );

    /* 3️⃣ Skills (NOW INCLUDES user_id ✅) */
    const skillsResult = await db.query(
      `
      SELECT
        s.id AS skill_id,
        s.user_id,                     -- ✅ OWNER ID
        s.title,
        s.description,
        s.level,
        s.category,
        s.created_at,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(r.id)::int AS review_count
      FROM skills s
      LEFT JOIN reviews r
        ON (
          r.skill_offered_id = s.id
          OR r.skill_requested_id = s.id
        )
        AND r.from_user_id <> s.user_id   -- ✅ prevent self-review
      WHERE s.user_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
      `,
      [user.id]
    );

    /* 4️⃣ Reviews per skill (NO self reviews) */
    const skillsWithReviews = await Promise.all(
      skillsResult.rows.map(async (skill) => {
        const reviewsResult = await db.query(
          `
          SELECT
            r.id,
            r.rating,
            r.review_text,
            r.created_at,
            u.username AS reviewer_username,
            u.img_url AS reviewer_avatar
          FROM reviews r
          JOIN users u ON u.id = r.from_user_id
          WHERE (
              r.skill_offered_id = $1
              OR r.skill_requested_id = $1
            )
            AND r.from_user_id <> $2
          ORDER BY r.created_at DESC
          `,
          [skill.skill_id, user.id]
        );

        return {
          ...skill,
          reviews: reviewsResult.rows,
        };
      })
    );

    /* 5️⃣ Overall rating */
    const overallRatingResult = await db.query(
      `
      SELECT
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS overall_rating,
        COUNT(*)::int AS total_reviews
      FROM reviews
      WHERE to_user_id = $1
      `,
      [user.id]
    );

    res.status(200).json({
      profile: user,
      stats: {
        successful_exchanges: exchangeResult.rows[0].successful_exchanges,
        overall_rating: overallRatingResult.rows[0].overall_rating,
        total_reviews: overallRatingResult.rows[0].total_reviews,
      },
      skills: skillsWithReviews,
    });
  } catch (err) {
    console.error("GET /profile/:username error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
