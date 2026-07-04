const pool =
require("../modules/db");

const generateAI =
require("./openRouterServices");



exports.createStudentMemory =
async(eventId,userId)=>{


const result =
await pool.query(
`
SELECT *
FROM event_ai_student_memory

WHERE event_id=$1
AND user_id=$2

`,
[
eventId,
userId
]
);



if(result.rows.length===0){


await pool.query(
`
INSERT INTO event_ai_student_memory
(
event_id,
user_id
)

VALUES($1,$2)

`,
[
eventId,
userId
]
);


}



};





exports.getStudentMemory =
async(eventId,userId)=>{


const result = await pool.query(
`
SELECT *
FROM event_ai_student_memory

WHERE event_id=$1
AND user_id=$2

`,
[
eventId,
userId
]
);


return result.rows[0];

};


exports.updateMemory =
async(data)=>{


const {

eventId,
userId,
evaluation,
module

}=data;



const prompt = `

Analyze this student's performance.


Module:

${module}


Score:

${evaluation.score}


Feedback:

${evaluation.feedback}



Return JSON ONLY:

{
"new_strengths":[],
"new_weaknesses":[]
}

`;

const result = await generateAI(prompt);


console.log(
"🧠 RAW MEMORY AI RESPONSE:",
result
);


let cleanResponse = result
.replace(/```json/g, "")
.replace(/```/g, "")
.trim();


// extract only JSON object
const jsonStart = cleanResponse.indexOf("{");
const jsonEnd = cleanResponse.lastIndexOf("}");



if(jsonStart !== -1 && jsonEnd !== -1){

cleanResponse =
cleanResponse.substring(
jsonStart,
jsonEnd + 1
);

}



const analysis = JSON.parse(cleanResponse);


console.log(
"✅ MEMORY ANALYSIS:",
analysis
);

// const analysis =
// JSON.parse(result);

await pool.query(
`

UPDATE event_ai_student_memory

SET

strengths=$1,

weaknesses=$2,

average_score=
(
average_score + $3
)/2,

modules_completed=
modules_completed + 1,


updated_at=NOW()


WHERE event_id=$4
AND user_id=$5


`,
[
JSON.stringify(
analysis.new_strengths
),

JSON.stringify(
analysis.new_weaknesses
),

evaluation.score,

eventId,

userId
]

);


};