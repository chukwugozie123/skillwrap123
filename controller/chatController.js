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
  const {duration, intensity, steps, goal, rules } = req.body 

  console.log(duration, intensity, steps, goal, rules, 'afd all in one place,,,,')
try {
await db.query(
  `UPDATE rooms
   SET duration = $1,
       intensity = $2,
       steps = $3,
       goal = $4,
       rules = $5
   WHERE exchange_id = $6`,
  [duration, intensity, steps, goal, rules, roomId]
)
  
  res.json({
    succes: true,
    message: "Successfully set attachment."
  })
} catch (error) {
  res.json({
    succes: false,
    message: "Failed to set attachment"
  })
}
}
exports.GetAttachment = async (req, res) => {
  const { roomId } = req.params

  try {
    const result = await db.query(
      "SELECT duration, intensity, steps, goal, rules FROM rooms WHERE exchange_id = $1",
      [roomId]
    )

    res.json({
      success: true,
      attachment: result.rows[0]
    })
  } catch (error) {
    res.json({
      success: false,
      message: "Failed to fetch room info"
    })
  }
}