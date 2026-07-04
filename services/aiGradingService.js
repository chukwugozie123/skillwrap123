const pool = require("../modules/db");

const generateAI =
require("./openRouterServices");



exports.saveAnswer = async(data)=>{


await pool.query(
`
INSERT INTO event_ai_report
(
event_id,
user_id,
module,
question,
user_answer
)

VALUES($1,$2,$3,$4,$5)

`,
[
data.eventId,
data.userId,
data.module,
data.question,
data.answer
]

);


};




// const generateAI = require("./openRouterServices");

function safeJSONParse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    try {
      // extract first JSON object from response
      const match = text.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("No JSON found in AI response");
      }

      return JSON.parse(match[0]);
    } catch (e) {
      console.log("❌ AI RAW RESPONSE (PARSE FAILED):", text);

      // SAFE FALLBACK (never crash system)
      return {
        score: 0,
        feedback: "AI failed to generate a valid evaluation. Please try again.",
        pass: false,
        next_question: "Please retry the question."
      };
    }
  }
}

exports.gradeAnswer = async (data) => {
  try {
    const prompt = `
You are an AI tutor grading a student.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No backticks
- No explanations
- Output must start with { and end with }

Output format:
{
  "score": number,
  "feedback": string,
  "pass": boolean,
  "next_question": string
}

Module:
${data.module}

Question:
${data.question}

Student Answer:
${data.answer}
`;

    const result = await generateAI(prompt);

    // ensure string safety
    if (!result || typeof result !== "string") {
      throw new Error("Invalid AI response");
    }

    const evaluation = safeJSONParse(result);

    return evaluation;

  } catch (error) {
    console.log("🔥 gradeAnswer ERROR:", error.message);

    // final fallback (NEVER break socket flow)
    return {
      score: 0,
      feedback: "Grading system error. Please try again.",
      pass: false,
      next_question: "Try answering again."
    };
  }
};




exports.updateReport = async(data)=>{


const {

eventId,
userId,
evaluation,
module, 
answer

}=data;


await pool.query(
`

UPDATE event_ai_report

SET
ai_score=$1,
feedback=$2


WHERE
event_id=$3
AND user_id=$4
AND user_answer=$5


`,
[
evaluation.score,
evaluation.feedback,
eventId,
userId,
answer
]

);



};