const db = require("../modules/db");

exports.checkAchievements = async (req, res) => {
  try {

    console.log("========== ACHIEVEMENT CHECK START ==========");

    const userId = req.user?.id;
    const { action } = req.body;

    console.log("Action received:", action);

    let achievement = null;
    let points = 0;

    // --------------------------
    // SKILL CREATED
    // --------------------------

    if (action === "skill_created") {

      console.log("Checking skill achievements...");

      const skillCountRes = await db.query(
        "SELECT COUNT(*) FROM skills WHERE user_id = $1",
        [userId]
      );


      const count = Number(skillCountRes.rows[0].count);


      if (count === 1) {
        achievement = "First Skill Created";
        points = 20;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 10) {
        achievement = "10 Skills Uploaded";
        points = 100;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 50) {
        achievement = "50 Skills Uploaded";
        points = 500;
        console.log("Achievement unlocked:", achievement);
      }
    }

    // --------------------------
    // REQUEST SENT
    // --------------------------

    if (action === "request_sent") {

      console.log("Checking request achievements...");

      const reqCountRes = await db.query(
        "SELECT COUNT(*) FROM exchange_skills WHERE from_user_id = $1",
        [userId]
      );

      console.log("Request query result:", reqCountRes.rows);

      const count = Number(reqCountRes.rows[0].count);

      console.log("Request count:", count);

      if (count === 1) {
        achievement = "First Request Sent";
        points = 5;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 15) {
        achievement = "15 Request sent";
        points = 15;
        console.log("Achievement unlocked:", achievement);
      }
    }

    // --------------------------
    // EXCHANGE COMPLETED
    // --------------------------

    if (action === "exchange_completed") {

      console.log("Checking exchange achievements...");

      const exchangeCountRes = await db.query(
        `SELECT COUNT(*) 
         FROM exchange_skills
         WHERE from_user_id = $1 AND exchange_status='completed'`,
        [userId]
      );

      console.log("Exchange query result:", exchangeCountRes.rows);

      const count = Number(exchangeCountRes.rows[0].count);

      console.log("Exchange count:", count);

      if (count === 1) {
        achievement = "First Exchange Completed";
        points = 40;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 10) {
        achievement = "10 Exchanges Completed";
        points = 150;
        console.log("Achievement unlocked:", achievement);
      }

      if (count === 20) {
        achievement = "20 Exchanges Completed";
        points = 300;
        console.log("Achievement unlocked:", achievement);
      }
    }

    // --------------------------
    // ADD POINTS
    // --------------------------

   if(points > 0){

console.log(
"Finding achievement id..."
);


// 1. Find achievement ID

const achievementResult = await db.query(
`
SELECT id
FROM achievements
WHERE name=$1
`,
[
achievement
]
);



if(achievementResult.rows.length === 0){

console.log(
"Achievement does not exist in database"
);


return res.json({

success:false,

message:"Achievement missing"

});

}



const achievementId =
achievementResult.rows[0].id;



console.log(
"Achievement ID:",
achievementId
);




// 2. Insert user achievement

await db.query(
`
INSERT INTO user_achievements
(
user_id,
achievement_id
)

VALUES
($1,$2)

ON CONFLICT(user_id,achievement_id)
DO NOTHING

`,
[
userId,
achievementId
]
);



console.log(
"Achievement saved for user"
);





// 3. Add points


await db.query(
`
UPDATE users

SET points = points + $1

WHERE id=$2
`,
[
points,
userId
]
);



console.log(
"Points added"
);



return res.json({

success:true,

achievement,

achievementId,

points

});


}
    console.log("No achievement unlocked");
    console.log("========== ACHIEVEMENT END ==========");

    return res.json({
      success: false
    });

    // INSERT INTO user_achievements
// (user_id, achievement_id)
// VALUES($1,$2)
// ON CONFLICT DO NOTHING
// Help us add dis inserts where is necessaru in  d code so we wont messup nd we need an achivements_id which cant be sen tfrom  d user sooo 
// task1: create an achivements tabel wiht SQL ready inserts with all dis similar achivemt ns oo like skill creted etc soo add does 
// 2: when we get d  achivemtn name e.g 20 Exchanges Completed u make  an sql query finding d id formd  ahcivements tbakle dne inser t  d id nd d user id of dat aprticular achivments.. u sabi d logic abi.


  } catch (err) {

    console.log("========== ACHIEVEMENT ERROR ==========");
    console.error("Error:", err);
    console.log("Request body:", req.body);
    console.log("User object:", req.user);
    console.log("========== END ERROR ==========");

    res.status(500).json({ error: "Achievement check failed" });
  }
};










// =======================================
// GET USER ACHIEVEMENTS
// =======================================

exports.getUserAchievements = async (req,res)=>{

    try {

        const userId = req.user?.id;


        console.log(
          "Fetching achievements for user:",
          userId
        );


        if(!userId){
            return res.status(401).json({
                success:false,
                message:"Unauthorized"
            });
        }



        const result = await db.query(
        `
        SELECT

        a.id,
        a.name,
        a.description,
        a.icon,
        a.reward_points,

        ua.unlocked_at


        FROM user_achievements ua


        JOIN achievements a

        ON ua.achievement_id = a.id


        WHERE ua.user_id=$1


        ORDER BY ua.unlocked_at DESC

        `,
        [
          userId
        ]
        );



        return res.json({

            success:true,

            total: result.rows.length,

            achievements: result.rows

        });



    } catch(err){


        console.log(
          "GET ACHIEVEMENTS ERROR:",
          err
        );


        res.status(500).json({

            success:false,

            message:"Failed to fetch achievements"

        });

    }
  }


// =====================================
// FETCH ALL ACHIEVEMENTS
// =====================================

exports.getAllAchievements = async (req,res)=>{
    try {
        const result = await db.query(
        `
        SELECT
            id,
            name,
            description,
            icon,
            reward_points,
            created_at
        FROM achievements
        ORDER BY id ASC
        `
        );

        return res.status(200).json({
            success:true,
            total:result.rows.length,
            achievements:result.rows
        });

    } catch(error){
        console.error(
            "FETCH ALL ACHIEVEMENTS ERROR:",
            error
        );
        return res.status(500).json({
            success:false,
            message:"Failed to fetch achievements"
        });
    }
};