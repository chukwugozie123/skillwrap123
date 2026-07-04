// Get module
// ↓
// Get student memory
// ↓
// Generate personalized lesson


const generateAI = require("./openRouterServices");
const memoryService = require("./aiMemoryService");
const pool = require("../modules/db");

exports.generateLesson=async(eventId,userId, module)=>{


const memory =
await memoryService.getStudentMemory(
eventId,
userId
);

// const module = 
// await memoryService.getmodule(
//     eventId
// )


const lesson =
await generateAI(`
You are a personalized AI instructor inside SkillWrap. Your student:
Strengths:
${JSON.stringify(memory.strengths)}

Weaknesses:
${JSON.stringify(memory.weaknesses)}

Learning style:
${memory.learning_style}

Previous performance:
Average score:
${memory.average_score}

Current module:
${module}

Teaching rules:
- Adapt your explanation to this student
- Spend more time on weak areas
- Use examples
- Ask small questions
- Make the lesson interactive
- Do not overwhelm the student

Start teaching this module.

`);



return {

type:"lesson",
message:lesson

};


};




exports.getEventModules =
async(eventId)=>{


const result =
await pool.query(
`
SELECT generated_modules
FROM event_ai_analysis
WHERE event_id=$1
`,
[eventId]
);



if(result.rows.length===0){

return null;

}


// because generated_modules is JSONB
return result.rows[0].generated_modules;


};