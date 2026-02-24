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
 const result =  await db.query("INSERT INTO rooms (duration, intensity, steps, goal) VALUES ($1, $2, $3, $4)", 
    [duration, intensity, steps, goal]
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

exports.GetAttachment = async(req, res) => {
  const userId = req.user?.id
  const {roomId} = req.body
  try {
      const roomRes = await pool.query(
        "SELECT * FROM rooms WHERE exchange_id = $1 OR user_id = $2",
        [roomId, userId]
      );
  } catch (error) {
    res.json({
      succes: false,
      message: 'Failed to fecth room Info/attachment'
    })
  }
}