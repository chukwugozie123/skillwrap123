const db = require("../modules/db");

exports.createActivity = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
    //   user_id,
      activity_type,
      title,
      description,
      related_user_id,
      related_skill_id,
      related_exchange_id,
      metadata,
      icon,
      color,
    } = req.body;

    const result = await db.query(
      `INSERT INTO recent_activities
       (user_id, activity_type, title, description,
        related_user_id, related_skill_id, related_exchange_id,
        metadata, icon, color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        user_id,
        activity_type,
        title,
        description,
        related_user_id || null,
        related_skill_id || null,
        related_exchange_id || null,
        metadata ? JSON.stringify(metadata) : {},
        icon,
        color,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create activity" });
  }
};

exports.getUserActivities = async (req, res) => {
  try {
    const  userId  = req.user.id;
    console.log(userId);

    const result = await db.query(
      `SELECT * FROM recent_activities
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

exports.logActivity = async ({
  user_id,
  activity_type,
  title,
  description,
  related_user_id = null,
  related_skill_id = null,
  related_exchange_id = null,
  metadata = {},
  icon = "activity",
  color = "blue",
}) => {
  return db.query(
    `INSERT INTO recent_activities
     (user_id, activity_type, title, description,
      related_user_id, related_skill_id, related_exchange_id,
      metadata, icon, color)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      user_id,
      activity_type,
      title,
      description,
      related_user_id,
      related_skill_id,
      related_exchange_id,
      JSON.stringify(metadata),
      icon,
      color,
    ]
  );
};