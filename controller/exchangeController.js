
const db = require("../modules/db");

// Exchange Skill Controller
exports.exchange = async (req, res) => {
  const { toUserId, skillRequestedId, offeredSkillId, note } = req.body;

  const fromUserid = req.user?.id; // ✅ from passport
  console.log("test", fromUserid, toUserId, skillRequestedId, offeredSkillId)

  if (!fromUserid || !toUserId || !skillRequestedId || !offeredSkillId) {
    return res.status(400).json({
      message: "Please fill in all fields...",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO exchange_skills (from_user_id, to_user_id, skill_offered_id, skill_requested_id, note, mode)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fromUserid, toUserId, offeredSkillId, skillRequestedId, note,'exchange']
    );

    res.status(201).json({
      success: true,
      request: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send request" });
  }

}


exports.exchange_learn = async (req, res) => {
  const { toUserId, skillRequestedId, note} = req.body;

  const fromUserid = req.user?.id; // ✅ from passport
  console.log("checking field", fromUserid, toUserId, skillRequestedId)

  if (!fromUserid || !toUserId || !skillRequestedId) {
    return res.status(400).json({
      message: "Please fill in all fields...",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO exchange_skills (from_user_id, to_user_id, skill_requested_id, note, mode)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fromUserid, toUserId, skillRequestedId, note, 'learning']
    );

    res.status(201).json({
      success: true,
      request: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send request" });
  }

}
// ==================== EXCHANGE CONTROLLER ====================

exports.getSentRequests = async (req, res) => {
  const currentUserId = req.user?.id;
  if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const query = `
      SELECT 
        es.id AS exchange_id,
        es.from_user_id,
        es.to_user_id,
        es.skill_offered_id,
        es.skill_requested_id,
        es.status,
        es.exchange_status,
        es.mode,
        es.note,
        es.created_at,

        -- Receiver info
        u_to.username AS to_username,
        u_to.fullname AS to_fullname,

        -- Skill titles
        s_offered.title AS skill_offered_title,
        s_requested.title AS requested_skill_title

      FROM exchange_skills es
      JOIN users u_to ON es.to_user_id = u_to.id
      LEFT JOIN skills s_offered ON s_offered.id = es.skill_offered_id
      LEFT JOIN skills s_requested ON s_requested.id = es.skill_requested_id
      WHERE es.from_user_id = $1
      ORDER BY es.created_at DESC;
    `;

    const result = await db.query(query, [currentUserId]);
    res.status(200).json({ success: true, total: result.rows.length, requests: result.rows });
  } catch (error) {
    console.error("❌ Error fetching sent requests:", error);
    res.status(500).json({ message: "Failed to fetch sent requests" });
  }
};

exports.getReceivedRequests = async (req, res) => {
  const currentUserId = req.user?.id;
  if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const query = `
      SELECT 
        es.id AS exchange_id,
        es.from_user_id,
        es.to_user_id,
        es.skill_offered_id,
        es.skill_requested_id,
        es.status,
        es.exchange_status,
        es.mode,
        es.note,
        es.created_at,

        -- Sender info
        u_from.username AS from_username,
        u_from.fullname AS from_fullname,

        -- Skill titles
        s_offered.title AS skill_offered_title,
        s_requested.title AS requested_skill_title

      FROM exchange_skills es
      JOIN users u_from ON es.from_user_id = u_from.id
      LEFT JOIN skills s_offered ON s_offered.id = es.skill_offered_id
      LEFT JOIN skills s_requested ON s_requested.id = es.skill_requested_id
      WHERE es.to_user_id = $1
      ORDER BY es.created_at DESC;
    `;

    const result = await db.query(query, [currentUserId]);
    res.status(200).json({ success: true, total: result.rows.length, requests: result.rows });
  } catch (error) {
    console.error("❌ Error fetching received requests:", error);
    res.status(500).json({ message: "Failed to fetch received requests" });
  }
};



//get number 
exports.getStats = async (req, res) => {
    const userID = req.user?.id 


    try {
      const createdSkill = await db.query("SELECT COUNT(*) FROM skills WHERE user_id = $1", [userID]);
      const sendRequests = await db.query("SELECT COUNT(*) FROM exchange_skills where from_user_id = $1", [userID])
      const recievedRequests = await db.query("SELECT COUNT(*) FROM exchange_skills where to_user_id = $1", [userID])
      const succesfullExchnaged = await db.query("SELECT COUNT (*) FROM exchange_skills WHERE exchange_status = 'completed' AND from_user_id = $1", [userID])
      const canclledExchnaged = await db.query("SELECT COUNT (*) FROM exchange_skills WHERE exchange_status = 'cancelled' AND from_user_id = $1", [userID])
      

      res.status(200).json({
        success: true,
        createdSkill: parseInt(createdSkill.rows[0].count),
        sendRequests: parseInt(sendRequests.rows[0].count),
        receivedRequests: parseInt(recievedRequests.rows[0].count),
        succesfullExchnage: parseInt(succesfullExchnaged.rows[0].count),
        canclledExchnaged: parseInt(canclledExchnaged.rows[0].count)
      })
    } catch (error) {
      res.status(500).json(500)({
        error:'failed to grt skill stats'
      })
    }
  }


exports.updateStatus = async (req, res) => {
  try {

    // const exchange_id = req.user?.id
    const { status, exchange_id } = req.body;

    if (!exchange_id || !status) {
      return res.json({ success: false, error: "Missing fields" });
    }

    await db.query(
      `UPDATE exchange_skills SET status = $1 WHERE id = $2`,
      [status, exchange_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


exports.updateExchangeStatus = async (req, res) => {
  try {
    const { exchange_id, exchange_status } = req.body;
    const userId = req.user?.id;

    if (!exchange_id || !exchange_status) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Ensure only participants can update
    const check = await db.query(
      `SELECT * FROM exchange_skills 
       WHERE id = $1 AND (from_user_id = $2 OR to_user_id = $2)`,
      [exchange_id, userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized exchange update" });
    }

    const result = await db.query(
      `UPDATE exchange_skills
       SET exchange_status = $1
       WHERE id = $2
       RETURNING *`,
      [exchange_status, exchange_id]
    );

    res.json({
      success: true,
      exchange: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Update exchange status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getExchangeDetails = async (req, res) => {
  try {
    const { exchange_id } = req.params;
    const userId = req.user?.id;

    const query = `
      SELECT
        es.id AS exchange_id,
        es.exchange_status,
        es.status,
        es.created_at,

        -- Users
        u1.id AS from_user_id,
        u1.username AS from_username,
        u2.id AS to_user_id,
        u2.username AS to_username,

        -- Skills
        s_offer.id AS skill_offered_id,
        s_offer.title AS skill_offered_title,

        s_req.id AS skill_requested_id,
        s_req.title AS skill_requested_title

      FROM exchange_skills es
      JOIN users u1 ON es.from_user_id = u1.id
      JOIN users u2 ON es.to_user_id = u2.id
      JOIN skills s_offer ON es.skill_offered_id = s_offer.id
      JOIN skills s_req ON es.skill_requested_id = s_req.id
      WHERE es.id = $1
        AND (es.from_user_id = $2 OR es.to_user_id = $2)
    `;

    const result = await db.query(query, [exchange_id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Exchange not found" });
    }

    res.json({
      success: true,
      exchange: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Fetch exchange error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.DeleteExhanage = async (req, res) => {
    const {exchange_id} = req.body
  try {
     await db.query("DELETE FROM exchange_skills WHERE id = $1", [exchange_id]);
        
     res.json({
        success: true,
        message: "Deleted succesfully"
      });
  } catch (error) {
    console.error("delete-exchange error:", error);
    res.status(500).json({ success: false, error: "Failed to delete exhchange." });
  }
}


// exports.get_exchnage = async (req, res) => {
//   const exchange_id = req.body

//   const result = await db.query("SELECT * FROM exchnage_skill WHERE exchnage_id = $1", [exchange_id])

//   res.json({
//     success: true,
//     request: result.rows
//   })
// };