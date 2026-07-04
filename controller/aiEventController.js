const db = require("../modules/db");
const generateAI = require("../services/openRouterServices");



exports.generateEventAI = async(req,res)=>{

    try {

        const {id} = req.params;


        // Get event

        const eventResult = await db.query(
            `
            SELECT 
            id,
            title,
            description,
            category,
            type,
            difficulty,
            technologies,
            modules

            FROM events

            WHERE event_no=$1
            `,
            [id]
        );


        if(eventResult.rows.length === 0){

            return res.status(404).json({
                success:false,
                message:"Event not found"
            });

        }


        const event = eventResult.rows[0];


const prompt = `
You are a strict JSON generator for a backend system.

You MUST follow all rules exactly. No exceptions.

---

INPUT EVENT
Title: ${event.title}
Description: ${event.description}
Category: ${event.category}
Type: ${event.type}
Difficulty: ${event.difficulty}
Technologies: ${JSON.stringify(event.technologies)}

---

TASK
Analyze the event and generate a structured learning plan.

---

STRICT RULES (VERY IMPORTANT)
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT use backticks (no \`\`\`)
- Do NOT explain anything
- Do NOT add extra keys
- All keys must match exactly
- No comments inside JSON
- No trailing commas
- All arrays must contain strings only
- difficulty_score MUST be a number from 1 to 10 (NOT text)

---

OUTPUT FORMAT (MUST MATCH EXACTLY)

{
  "event_type": "string",
  "difficulty_score": number,
  "learning_objectives": ["string"],
  "modules": ["string"],
  "recommended_skills": ["string"]
}

---

VALIDATION EXAMPLES

Wrong:
"difficulty_score": 5

Correct:
"difficulty_score": "intermediate"

---

Return ONLY the JSON object.
`;



const aiResponse = await generateAI(prompt);



        // save result
        function parseAIResponse(aiResponse) {
  try {
    // remove ```json and ```
    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    return null;
  }
}

const parsed = parseAIResponse(aiResponse);

if (!parsed) {
  throw new Error("Invalid AI response format");
}

console.log(id, 'id of eent')


await db.query(
  `
  INSERT INTO event_ai_analysis
  (
    event_id,
    ai_model,
    event_summary,
    event_type,
    generated_modules,
    learning_objectives,
    recommended_skills,
    difficulty_score
  )
  VALUES($1,$2,$3,$4,$5,$6,$7,$8)
  `,
  [
    id,
    "deepseek/deepseek-chat",
    aiResponse,
    parsed.event_type, // or full summary if you want
    JSON.stringify(parsed.modules || []),
    JSON.stringify(parsed.learning_objectives || []),
    JSON.stringify(parsed.recommended_skills || []),
    parsed.difficulty_score
  ]
);

        res.json({

            success:true,

            analysis:aiResponse

        });



    }catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:"AI generation failed"

        });

    }

}

