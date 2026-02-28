const db = require("../modules/db");

exports.getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    /* 1️⃣ User profile */
    const userResult = await db.query(
      `
      SELECT id, fullname, username, img_url, created_at
      FROM users
      WHERE id = $1
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

    /* 3️⃣ Cancelled exchanges */
    const cancelledExchangeResult = await db.query(
      `
      SELECT COUNT(*)::int AS cancelled_exchanges
      FROM exchange_skills
      WHERE exchange_status = 'cancelled'
        AND ($1 = from_user_id OR $1 = to_user_id)
      `,
      [user.id]
    );

/* 4️⃣ Skills with ratings + user info */
const skillsResult = await db.query(
  `
  SELECT
    s.id AS skill_id,
    s.user_id,
    s.title,
    s.description,
    s.level,
    s.category,
    s.skill_img,
    s.created_at,

    -- ratings
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
    COUNT(r.id)::int AS review_count,

    -- user info (NEW)
    u.username,
    u.fullname,
    u.mode AS user_mode,
    u.bio AS user_bio

  FROM skills s
  JOIN users u ON u.id = s.user_id
  LEFT JOIN reviews r
    ON (
      r.skill_offered_id = s.id
      OR r.skill_requested_id = s.id
    )
    AND r.from_user_id <> s.user_id

  WHERE s.user_id = $1
  GROUP BY s.id, u.id
  ORDER BY s.created_at DESC
  `,
  [user.id]
);


    /* 5️⃣ Reviews per skill */
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

        // console.log(reviewsResult.rows, 'cek')

        return {
          ...skill,
          reviews: reviewsResult.rows,
        };
      })
    );

    /* 6️⃣ Overall rating */
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
        cancelled_exchanges:
        cancelledExchangeResult.rows[0].cancelled_exchanges,
        overall_rating: overallRatingResult.rows[0].overall_rating,
        total_reviews: overallRatingResult.rows[0].total_reviews,
      },
      // skills: {
      //   skillsWithReviews
      // },
      skillsWithReviews
    });
  } catch (err) {
    console.error("GET /profile/:username error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
