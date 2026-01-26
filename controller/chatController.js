const db = require("../modules/db");

/**
 * GET messages for an exchange
 * GET /exchange/:exchange_id/messages
 */
exports.getMessages = async (req, res) => {
  const { exchange_id } = req.params;

  try {
    const { rows } = await db.query(
      `
      SELECT id, sender, message, image_url, created_at
      FROM exchange_messages
      WHERE exchange_id = $1
      ORDER BY created_at ASC
      `,
      [exchange_id]
    );

    res.json({
      success: true,
      messages: rows,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
};

/**
 * SAVE a message
 * POST /exchange/:exchange_id/messages
 */
exports.createMessage = async (req, res) => {
  const { exchange_id } = req.params;
  const { sender, message, image_url } = req.body;

  if (!sender || (!message && !image_url)) {
    return res.status(400).json({
      success: false,
      error: "Invalid message payload",
    });
  }

  try {
    const { rows } = await db.query(
      `
      INSERT INTO exchange_messages 
      (exchange_id, sender, message, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, sender, message, image_url, created_at
      `,
      [exchange_id, sender, message || null, image_url || null]
    );

    res.status(201).json({
      success: true,
      message: rows[0],
    });
  } catch (error) {
    console.error("createMessage error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save message",
    });
  }
};
