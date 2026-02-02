// backend/models/UserModel.js
const db = require("../modules/db");//  your Postgres pool

// Get all users with their skills
async function getAllUsersWithSkills() {
  const client = await db.connect();
  try {
    // Fetch users with their skills
    const usersRes = await client.query(
      `SELECT u.id AS user_id, u.fullname, u.username, u.img_url AS profileImage,
              s.id AS skill_id, s.title AS skill_title, s.level AS skill_level,
              s.category AS skill_category, s.skill_img
       FROM users u
       LEFT JOIN skills s ON s.user_id = u.id`
    );

    // Transform to {id, fullname, username, profileImage, skills: []}
    const usersMap = new Map();

    usersRes.rows.forEach((row) => {
      if (!usersMap.has(row.user_id)) {
        usersMap.set(row.user_id, {
          id: row.user_id,
          fullname: row.fullname,
          username: row.username,
          profileImage: row.profileimage || "/default-user.png",
          skills: [],
        });
      }
      if (row.skill_id) {
        usersMap.get(row.user_id).skills.push({
          id: row.skill_id,
          title: row.skill_title,
          level: row.skill_level,
          category: row.skill_category,
          skill_img: row.skill_img || "/default-skill.png",
        });
      }
    });

    return Array.from(usersMap.values());
  } finally {
    client.release();
  }
}

// CommonJS export
module.exports = { getAllUsersWithSkills };
