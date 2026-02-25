const db = require("../modules/db");

exports.GetMyRoom = async (req, res) => {
  const userId = req.user?.id

  try {
    const result =  await db.query("SELECT * FROM rooms WHERE user_id = $1", [userId])

    res.json({
      succes: true,
      room: result.rows,
      message: "succesfully fecthed room"
    })
  } catch (error) {
    res.json({
      succes: false,
      message: "failed to fecth room"
    })
  }
}


exports.userSetAttachment = async (req, res) => {
  const {duration, intensity, steps, goal, rules, exchange_id } = req.body 

  console.log(duration, intensity, steps, goal, rules, exchange_id)
try {
await db.query(
  `UPDATE rooms
   SET duration = $1,
       intensity = $2,
       steps = $3,
       goal = $4,
       rules = $5
   WHERE exchange_id = $6`,
  [duration, intensity, steps, goal, rules, exchange_id]
)
  
res.json({
  success: true,
  message: "Successfully set attachment."
})
} catch (error) {
  res.json({
    success: false,
    message: "Failed to set attachment"
  })

  console.log(error)
}
}



exports.GetAttachment = async (req, res) => {
  const { exchange_id } = req.params;

  try {
    const result = await db.query(
      `SELECT duration, intensity, steps, goal, rules
       FROM rooms
       WHERE exchange_id = $1`,
      [exchange_id]
    );

    if (!result.rows.length) {
      return res.json({
        success: true,
        attachment: null
      });
    }

    return res.json({
      success: true,
      attachment: result.rows[0]
    });

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Failed to fetch attachment"
    });
  }
};