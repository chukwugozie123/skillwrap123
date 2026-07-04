const pool = require("../modules/db");
const exchangeAIService =  require("../services/exchangeAIService");

let activeUsers = [];

const activeExchanges = {};


function setupExchangeSocket(io, socket) {


 console.log("✅ Exchange socket ready:", socket.id);


  /* ================= ENTER PRIVATE ROOM ================= */
  socket.on("enterRoom", async ({ roomId, userId }) => {

    console.log("📥 enterRoom received:", {
      roomId,
      userId
    });


    try {

      if (!roomId || !userId) {
        console.log("❌ Missing roomId or userId");
        return;
      }


      const roomRes = await pool.query(
        "SELECT * FROM rooms WHERE exchange_id = $1",
        [roomId]
      );


      if(roomRes.rows.length === 0){
        console.log("❌ No room found");
        return;
      }


      const room = roomRes.rows[0];


      const socketRoom = `room_001${room.id}`;


      socket.join(socketRoom);



      activeUsers = activeUsers.filter(
        u => u.socketId !== socket.id
      );

      activeUsers.push({
        socketId: socket.id,
        userId,
        roomId: room.id,
        socketRoom

      });



      const userRes = await pool.query(
        "SELECT username FROM users WHERE id=$1",
        [userId]
      );


      const username = userRes.rows[0].username;



      socket.emit("message",{

        text:"Welcome to your exchange chat",
        username:"System",
        created_at:new Date()

      });



      socket.to(socketRoom).emit("message",{

        text:`${username} joined the chat`,
        username:"System",
        created_at:new Date()

      });




      const messagesRes = await pool.query(
        `
        SELECT 
        messages.id,
        messages.text,
        messages.created_at,
        users.username

        FROM messages

        JOIN users 
        ON users.id = messages.sender_id

        WHERE room_id=$1

        ORDER BY messages.created_at ASC

        `,
        [room.id]
      );



      socket.emit(
        "previousMessages",
        messagesRes.rows
      );




      if(activeExchanges[socketRoom]){

        socket.emit(
          "countdown",
          activeExchanges[socketRoom].timeLeft
        );

      }



    }catch(err){

      console.error(
        "❌ EnterRoom Error:",
        err
      );

    }


  });





  /* ================= SEND MESSAGE ================= */


  socket.on("message", async ({text})=>{


    try{


      const user =
      activeUsers.find(
        u=>u.socketId === socket.id
      );


      if(!user || !text)
      return;




      const msgRes = await pool.query(

        `
        INSERT INTO messages
        (
        room_id,
        sender_id,
        text
        )

        VALUES($1,$2,$3)

        RETURNING *

        `,

        [
          user.roomId,
          user.userId,
          text
        ]

      );



      const userRes =
      await pool.query(
        "SELECT username FROM users WHERE id=$1",
        [user.userId]
      );



      const username =
      userRes.rows[0].username;


const savedMessage = msgRes.rows[0];

io.to(user.socketRoom).emit("message", {
  id: savedMessage.id,
  text: savedMessage.text,
  username,
  sender_id: user.userId,
  created_at: savedMessage.created_at
});


    }catch(err){

      console.error(
        "Message Error:",
        err
      );

    }


  });

  /* ================= TYPING ================= */

  socket.on("typing",({name})=>{


    const user =
    activeUsers.find(
      u=>u.socketId===socket.id
    );


    if(!user)
    return;


    socket.to(user.socketRoom)
    .emit(
      "typing",
      {name}
    );


  });





  /* ================= COUNTDOWN ================= */

  socket.on(
  "startCountdown",
  async({roomId,duration})=>{


    const roomRes =
    await pool.query(
      "SELECT * FROM rooms WHERE exchange_id=$1",
      [roomId]
    );


    const room =
    roomRes.rows[0];


    const socketRoom =
    `room_001${room.id}`;



    if(activeExchanges[socketRoom])
    return;



    const endTime =
    Date.now()+duration*60*1000;



    const interval =
    setInterval(()=>{


      const diff =
      endTime-Date.now();



      const mins =
      Math.floor(diff/60000);


      const secs =
      Math.floor(
        (diff%60000)/1000
      );



      const formatted =
      `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;



      activeExchanges[socketRoom]={
        interval,
        endTime,
        timeLeft:formatted
      };



      io.to(socketRoom)
      .emit(
        "countdown",
        formatted
      );



      if(diff<=0){

        clearInterval(interval);

        io.to(socketRoom)
        .emit(
          "countdownEnded"
        );


        delete activeExchanges[socketRoom];

      }


    },1000);



  });


  socket.on("newFile",(data)=>{
      const user =
      activeUsers.find(
      u=>u.socketId===socket.id
      );



      io.to(user.socketRoom)
      .emit(
      "fileUploaded",
      data
      );
  });



  /* ================= EXCHANGE AI ================= */


socket.on(
"exchangeAIMessage",
async({message})=>{


try{


const user =
activeUsers.find(
u=>u.socketId === socket.id
);



if(!user)
return;



console.log(
"🤖 EXCHANGE AI QUESTION:",
message
);



const exchangeRes =
await pool.query(
`
SELECT 
es.id,
s.title AS skill_title

FROM exchange_skills es

JOIN skills s
ON s.id = es.skill_offered_id

WHERE es.id=$1
`,
[
user.roomId
]
);



const topic =
exchangeRes.rows[0]?.skill_title 
||
"General Skill Exchange";



const reply =
await exchangeAIService.reply({

topic,

message

});




socket.emit(
"exchangeAIReply",
{

type:"ai",

message:reply

}
);



}catch(error){

console.log(
"❌ Exchange AI Error:",
error
);


socket.emit(
"exchangeAIReply",
{
type:"error",
message:"AI assistant failed."
}
);


}

});




  /* ================= QUIT ================= */


  socket.on(
  "quitExchange",
  ({roomId})=>{


    console.log(
      "Quit exchange:",
      roomId
    );


  });





  /* ================= DISCONNECT ================= */


  socket.on(
  "disconnect",
  ()=>{


    const index =
    activeUsers.findIndex(
      u=>u.socketId===socket.id
    );


    if(index===-1)
    return;



    const user =
    activeUsers[index];


    activeUsers.splice(index,1);



    io.to(user.socketRoom)
    .emit(
      "message",
      {
        text:"A user left the chat",
        username:"System",
        created_at:new Date()
      }
    );


  });



}


module.exports = setupExchangeSocket;















//dis is the only function dat is needed in d exhcnagecontroller which us euse to et infoa bout  aparticulr exchnage..
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


