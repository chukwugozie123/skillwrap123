const pool = require("../modules/db");


exports.saveAIMessage = async(eventId, userId, message, sender)=>{

await pool.query(
`INSERT INTO event_ai_messages
(event_id,user_id,message,sender)
VALUES($1,$2,$3,$4)`,
[eventId, userId, message, sender ] );
};


exports.GetPrevMessage = async(eventId, userId)=>{

const result = await pool.query(

`SELECT * FROM event_ai_messages 
WHERE event_id=$1 
AND user_id=$2
ORDER BY created_at ASC`,

[eventId,userId]

)

return result.rows;

}