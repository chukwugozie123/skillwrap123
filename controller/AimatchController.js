

// const db = require("../modules/db");

// // ✅ Export properly
// const aiSkillMatch = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { skillToLearn, skillToOffer } = req.body;

//     if (!skillToLearn) {
//       return res.status(400).json({
//         success: false,
//         message: "skillToLearn is required",
//       });
//     }

//     const normalize = (text) => text.toLowerCase().trim();
//     const learnSkill = normalize(skillToLearn);
//     const offerSkill = skillToOffer ? normalize(skillToOffer) : null;

//     const query = `
//       SELECT 
//         u.id AS user_id,
//         u.fullname,
//         u.username,
//         u.img_url,
//         s.title AS skill_title,
//         s.level,
//         s.category
//       FROM skills s
//       JOIN users u ON s.user_id = u.id
//       WHERE LOWER(s.title) LIKE $1
//         AND u.id != $2
//     `;

//     const { rows } = await db.query(query, [`%${learnSkill}%`, userId]);

//     const matches = rows.map((row) => {
//       let score = 0;
//       let reasons = [];

//       if (row.skill_title.toLowerCase().includes(learnSkill)) {
//         score += 3;
//         reasons.push("Teaches the skill you want to learn");
//       }

//       if (offerSkill) {
//         score += 2;
//         reasons.push("Potential for skill exchange");
//       }

//       return {
//         userId: row.user_id,
//         fullname: row.fullname,
//         username: row.username,
//         profileImage: row.img_url,
//         skillOffered: row.skill_title,
//         level: row.level,
//         category: row.category,
//         matchScore: score,
//         reason: reasons.join(". "),
//       };
//     });

//     matches.sort((a, b) => b.matchScore - a.matchScore);

//     console.log(matches, matches.length);
//     return res.status(200).json({
//       success: true,
//       totalMatches: matches.length,
//       matches,
//     });
//   } catch (error) {
//     console.error("AI Skill Match Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while generating AI matches",
//     });
//   }
// };

// // ✅ Correct export
// module.exports = { aiSkillMatch };




// const db = require("../modules/db");
// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// exports.AiSkillMatch = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { skillToLearn, skillToOffer } = req.body;

//     if (!skillToLearn) {
//       return res.status(400).json({
//         success: false,
//         message: "skillToLearn is required",
//       });
//     }

//     // 1️⃣ Get all other users and their skills
//     const query = `
//       SELECT u.id AS user_id, u.fullname, u.username, u.img_url,
//              s.title AS skill_title, s.level, s.category
//       FROM skills s
//       JOIN users u ON s.user_id = u.id
//       WHERE u.id != $1
//     `;
//     const { rows } = await db.query(query, [userId]);

//     // 2️⃣ Ask GPT-3.5 to score and rank matches
//     const prompt = `
//       You are an AI that matches users based on skills.
//       The user wants to learn: "${skillToLearn}".
//       They can offer: "${skillToOffer || "none"}".
//       Here are other users and their skills in JSON format:
//       ${JSON.stringify(rows)}

//       Score each user from 0 to 10 based on how well they match,
//       give a reason, and return only JSON array of objects with:
//       userId, fullname, username, profileImage, skillOffered, level, category, matchScore, reason
//     `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.7,
//     });

//     const text = response.choices[0].message.content;
//     let matches = [];
//     try {
//       matches = JSON.parse(text);
//     } catch (err) {
//       console.error("Failed to parse GPT response:", text);
//       matches = [];
//     }

//     return res.status(200).json({
//       success: true,
//       totalMatches: matches.length,
//       matches,
//     });
//   } catch (error) {
//     console.error("AI Skill Match Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while generating AI matches",
//     });
//   }
// };






const OpenAI = require("openai");
const db = require("../modules/db");
const { getAllUsersWithSkills } = require("../modules/UserModel");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ensure you set this in .env
  basePath: "https://api.openai.com/v1",
  timeout: 60000, // 60 sec timeout
});


const AiSkillMatch = async (req, res) => { 
     const userId = req.user?.id; // or however you serialize user
  const { skillToLearn, skillToOffer } = req.body;

  if (!skillToLearn) {
    return res.status(400).json({ success: false, message: "Skill to learn is required" });
  }

  try {
    // 1️⃣ Fetch all users & skills from your database
    const allUsers = await getAllUsersWithSkills();

    // 2️⃣ Build prompt for AI
    const prompt = `
      You are an AI skill matcher. 
      The user wants to learn: "${skillToLearn}".
      ${skillToOffer ? `The user can offer: "${skillToOffer}".` : ""}
      Match them with other users who have skills that can help. 
      Reply with JSON array: 
      [
        {
          "userId": 1,
          "fullname": "Name",
          "username": "username",
          "profileImage": "url",
          "skillOffered": "Skill",
          "level": "Level",
          "category": "Category",
          "matchScore": 0-100,
          "reason": "Short reason why they match"
        }
      ]
    `;

    // 3️⃣ Call OpenAI
    let matches = [];
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      });

      matches = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      console.warn("AI response could not be parsed, falling back to local logic");
    }

    // 4️⃣ Fallback if AI fails or no matches
    if (!matches || matches.length === 0) {
      matches = allUsers
        .filter((u) => u.id !== userId)
        .map((u) => {
          const skillMatch = u.skills.find((s) =>
            s.title.toLowerCase().includes(skillToLearn.toLowerCase())
          );
          if (!skillMatch) return null;
          return {
            userId: u.id,
            fullname: u.fullname,
            username: u.username,
            profileImage: u.profileImage || "/default-user.png",
            skillOffered: skillMatch.title,
            level: skillMatch.level || "Beginner",
            category: skillMatch.category || "General",
            matchScore: Math.floor(Math.random() * 50) + 50,
            reason: `They have experience in ${skillMatch.title}`,
          };
        })
        .filter(Boolean);
    }

    res.json({ success: true, matches });
  } catch (err) {
    console.error("AI Skill Match Error:", err);
    res.status(500).json({ success: false, message: "AI Skill Match failed" });
  }
 }
const generateRoadmap = async (req, res) => {
  const userId = req.user.id; // ensureAuth must set req.user
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({
      success: false,
      message: "Goal is required",
    });
  }

  // 🧠 Reusable fallback pool (generic but intelligent)
  const fallbackPool = [
    {
      skill: "Foundational Knowledge",
      description: "Learn the core concepts and terminology related to this goal",
    },
    {
      skill: "Guided Tutorials",
      description: "Follow beginner-friendly tutorials and structured lessons",
    },
    {
      skill: "Practical Practice",
      description: "Apply knowledge by working on small real-world examples",
    },
    {
      skill: "Tools & Resources",
      description: "Get familiar with commonly used tools and platforms",
    },
    {
      skill: "Problem Solving",
      description: "Practice solving challenges related to this goal",
    },
    {
      skill: "Feedback & Improvement",
      description: "Review progress, identify gaps, and refine skills",
    },
    {
      skill: "Mini Project",
      description: "Build a small project to consolidate your learning",
    },
  ];

  // 🎲 Shuffle + pick 3–5 steps
  const buildFallbackRoadmap = () => {
    const shuffled = fallbackPool
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3); // 3–5 steps

    return shuffled.map((item, index) => ({
      step: index + 1,
      skill: item.skill,
      description: item.description,
    }));
  };

  try {
    const prompt = `
You are an AI learning guide.
Suggest a clear 3-5 step roadmap for a user to achieve this goal: "${goal}".

Return ONLY valid JSON in this format:
[
  {
    "step": 1,
    "skill": "Skill name",
    "description": "Brief explanation"
  }
]

Keep it beginner-friendly.
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    let roadmap;
    try {
      roadmap = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      console.warn("AI JSON parse failed, using fallback");
      roadmap = buildFallbackRoadmap();
    }

    // ✅ SAVE TO USER
    await db.query(
      `UPDATE users
       SET advice = $1
       WHERE id = $2`,
      [JSON.stringify(roadmap), userId]
    );

    return res.json({
      success: true,
      roadmap,
      ai_mode: "ai",
    });
  } catch (err) {
    console.error("AI Roadmap Error:", err);

    // 🚑 FALLBACK IF AI FAILS (quota, network, etc.)
    const fallbackRoadmap = buildFallbackRoadmap();

    await db.query(
      `UPDATE users
       SET advice = $1
       WHERE id = $2`,
      [JSON.stringify(fallbackRoadmap), userId]
    );

    return res.json({
      success: true,
      roadmap: fallbackRoadmap,
      ai_mode: "fallback",
      message: "AI unavailable. Generated smart offline roadmap.",
    });
  }
};




// ✅ export both together
module.exports = {
  AiSkillMatch,
  generateRoadmap,
};
