const db = require("../modules/db");


// ================= ADD XP =================

exports.InputXp = async (req,res)=>{

try{


const userId = req.user.id;

const {
xp,
action_type
}=req.body;



// Get user

const userResult =
await db.query(
`
SELECT 
xp,
level,
badges
FROM users
WHERE id=$1
`,
[userId]
);



if(userResult.rows.length===0){

return res.status(404).json({
success:false,
message:"User not found"
});

}



const user=userResult.rows[0];


// calculate XP

const totalXp =
Number(user.xp)+Number(xp);



// ================= LEVEL SYSTEM =================

let level=1;


if(totalXp>=1000){
level=10;
}

else if(totalXp>=500){
level=5;
}

else if(totalXp>=300){
level=4;
}

else if(totalXp>=200){
level=3;
}

else if(totalXp>=100){
level=2;
}



// ================= BADGE SYSTEM =================


let badgeName=null;


// First Event

if(action_type==="EVENT_COMPLETION"){

const check =
await db.query(
`
SELECT COUNT(*) 
FROM xp_transactions
WHERE user_id=$1
AND action_type='EVENT_COMPLETION'
`,
[userId]
);


if(Number(check.rows[0].count)===0){

badgeName="Event Champion";

}

}



// Skill Creator

if(action_type==="SKILL_CREATED"){


const skills =
await db.query(
`
SELECT COUNT(*)
FROM skills
WHERE user_id=$1
`,
[userId]
);



if(Number(skills.rows[0].count)>=5){

badgeName="Skill Master";

}


}



// XP Badge

if(totalXp>=1000){

badgeName="Community Hero";

}



// Find badge id

let badgeId=null;


if(badgeName){


const badge =
await db.query(
`
SELECT id 
FROM badges
WHERE name=$1
`,
[badgeName]
);


if(badge.rows.length){

badgeId=badge.rows[0].id;

}

}


// insert into userBages
const result = await db.query("INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)", [userId, badgeId])
const res = result.rows[0];
console.log("succesfully added");


// Update User

const updated =
await db.query(
`
UPDATE users

SET

xp=$1,

level=$2,

badges=
COALESCE($3,badges)

WHERE id=$4

RETURNING *

`,
[
totalXp,
level,
badgeId,
userId
]
);

res.json({

success:true,

message:"XP updated",

data:updated.rows[0],

level,

badge:badgeName

});


}

catch(error){

console.log(error);

res.status(500).json({

success:false,

message:"XP update failed"

});


}

};






// ================= TRANSACTION HISTORY =================
exports.XpTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xp, action } = req.body;

    await db.query(
      "INSERT INTO xp_transactions (user_id, xp_amount, action_type) VALUES ($1, $2, $3)",
      [userId, xp, action]
    );

    res.status(200).json({
      success: true,
      message: "successful",
    });
  } catch (error) {
    console.error("Adding xp_transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};












// const db = require("../modules/db");

// exports.InputXp = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { xp, badge } = req.body;

//         // Fetch current user XP and level
//         const currentUser = await db.query(
//             `SELECT xp, level FROM users WHERE id = $1`,
//             [userId]
//         );

//         if (currentUser.rows.length === 0) {
//             return res.status(404).json({
//                 error: "User not found."
//             });
//         }

//         const user = currentUser.rows[0];

//         // Add reward XP to existing XP
//         const totalXp = user.xp + xp;

//         // Simple level logic
//         const level = Math.floor(totalXp / 100) + 1;


//         // Save XP transaction
//         await db.query(`
//             INSERT INTO xp_transactions (
//                 user_id,
//                 xp_amount,
//                 action_type
//             )
//             VALUES (
//                 $1,
//                 $2,
//                 'EVENT_COMPLETION'
//             )
//         `, [userId, xp]);

//         // Fetch badge ID if badge was provided
//         let badgeId = null;

//         if (badge) {
//             const fetchBadge = await db.query(
//                 `SELECT id FROM badges WHERE name = $1`,
//                 [badge]
//             );

//             if (fetchBadge.rows.length > 0) {
//                 badgeId = fetchBadge.rows[0].id;
//             }
//         }

//         // Update user
//         const resultRow = await db.query(`
//             UPDATE users
//             SET
//                 xp = $1,
//                 level = $2,
//                 badges = $3
//             WHERE id = $4
//             RETURNING *
//         `, [
//             totalXp,
//             level,
//             badgeId,
//             userId
//         ]);

//         return res.status(200).json({
//             success: true,
//             message: "Successfully updated XP.",
//             data: resultRow.rows[0]
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             error: "Failed to update XP."
//         });
//     }
// };


// exports.XpTransactions = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { xp, action } = req.body;

//     await db.query(
//       "INSERT INTO xp_transactions (user_id, xp_amount, action_type) VALUES ($1, $2, $3)",
//       [userId, xp, action]
//     );

//     res.status(200).json({
//       success: true,
//       message: "successful",
//     });
//   } catch (error) {
//     console.error("Adding xp_transaction error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };