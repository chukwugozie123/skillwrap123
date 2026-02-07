const db = require("../modules/db");

// ✅ Homepage (all skills)
exports.home = async (req, res) => {
  try {
     const result = await db.query("SELECT * FROM skills ORDER BY id DESC LIMIT 4");
    // const result = await db.query("SELECT * FROM skills");
    const skills = result.rows;
    console.log(skills)

    res.status(200).json({
      success: true,
      user: req.user || null,
     skill: skills,
    });
  } catch (err) {
    console.err(err)
  }

};

exports.oneskill = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill id",
      });
    }

    // Fetch skill with user info
    const query = `
      SELECT 
        s.id AS skill_id,
        s.title,
        s.description,
        s.category,
        s.level,
        s.skill_img,
        s.youtubelink,
        s.learningpoint,
        s.portfolio_link,
        s.created_at, 
        u.id AS user_id,
        u.username,
        u.fullname
      FROM skills s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;

    const result = await db.query(query, [Number(id)]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const skill = result.rows[0];

    // Parse learning points JSON string to array
    let learningPoints = [];
    if (skill.learningpoint) {
      try {
        learningPoints = JSON.parse(skill.learningpoint);
      } catch (e) {
        learningPoints = [skill.learningpoint]; // fallback if not JSON
      }
    }

    res.status(200).json({
      success: true,
      skill: {
        id: skill.skill_id,
        title: skill.title,
        description: skill.description,
        category: skill.category,
        level: skill.level,
        skill_img: skill.skill_img,
        youtube_link: skill.youtubelink || null,
        learningPoints,
        portfolio_link: skill.portfolio_link || null, // ✅ move portfolio_link from skills table
        created_at: skill.created_at,
        user: {
          id: skill.user_id,
          username: skill.username,
          fullname: skill.fullname,
        },
      },
    });
  } catch (err) {
    console.error("❌ Error fetching skill:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// exports.getSkills = async (req, res) => {
//   try {
//     const result = await db.query(`
//       SELECT
//         skills.id,
//         skills.title,
//         skills.category,
//         skills.description,
//         skills.level,
//         skills.created_at,
//         users.username
//       FROM skills
//       LEFT JOIN users ON skills.user_id = users.id
//       ORDER BY skills.created_at DESC
//     `);

//     const skills = result.rows.map(skill => ({
//       ...skill,
//       username: skill.username || "Unknown",
//     }));

//     res.status(200).json({
//       success: true,
//       skills,
//     });
//   } catch (error) {
//     console.error("GET /skills error:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch skills",
//     });
//   }
// };


exports.getSkills = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        skills.id AS skill_id,
        skills.title,
        skills.category,
        skills.description,
        skills.level,
        skills.skill_img,
        skills.created_at,
        skills.user_id AS owner_id,
        users.username
      FROM skills
      LEFT JOIN users ON skills.user_id = users.id
      ORDER BY skills.created_at DESC
    `);

    const skills = result.rows.map(skill => ({
      skillId: skill.skill_id,
      title: skill.title,
      category: skill.category,
      description: skill.description,
      level: skill.level,
      skillImg: skill.skill_img,   // ✅ added
      createdAt: skill.created_at,
      ownerId: skill.owner_id,
      username: skill.username || "Unknown",
    }));

    res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error("GET /skills error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch skills",
    });
  }
};



// continue
// 6. spurious
// 7.Antedieuvian
// 8. renuniciation
// 9. tenable
// 10. catalogue



// ✅ Search Skill
exports.search = async (req, res) => {
  let { title } = req.query;
  title = title?.trim();

  try {
    const result = await db.query(
      "SELECT * FROM skills WHERE title ILIKE '%' || $1 || '%'",
      [title]
    );
    const foundSkills = result.rows;

    if (foundSkills.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No skill found with that title.",
      });
    }

    res.status(200).json({
      success: true,
      skills: foundSkills,
    });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong while searching.",
    });
  }
};


//  controllers/skillController.js
exports.viewSkill = async (req, res) => {
      const user_id = req.user.id;
  try {
    // Check if user is logged in
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated.",
      });
    }


    // ✅ Fetch all skills added by the logged-in user
    const result = await db.query(
      "SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );

    const foundSkills = result.rows;

    if (foundSkills.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No skills found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      skills: foundSkills,
    });
  } catch (error) {
    console.error("Error fetching user skills:", error.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong while fetching skills.",
    });
  }
};



// edit_skill 
exports.edit_skill = async (req, res) => {
  const { skillId } =  req.params
  const {title, description, level, category } = req.body
  console.log(skillId, title, description, level, category)
  try {
      await db.query(   
     `UPDATE skills
       SET title=$1, description=$2, level=$3, category=$4
       WHERE id=$5`,
       [title, description, level, category, skillId]
      )

      res.json({
        success: true,
        message: "updated succesfully"
      });
  } catch (error) {
    console.error("edit-skill error:", error);
    res.status(500).json({ success: false, error: "Failed to updated skill." });  
  }
}
// delete skill
exports.delete_skill = async (req, res) => {
  const { skillId } = req.params;

  try {
    await db.query("DELETE FROM skills WHERE id = $1", [skillId]);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("delete-skill error:", error);

    // Check if it's a foreign key violation
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete this skill because it is being used in active exchanges. Please remove it from exchanges first.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete skill.",
    });
  }
};

// exports.createSkill = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: "Skill image is required" });
//     }

//     const { skillname, skilldesc, category, skilllevel, youtube_link, learningPoints } = req.body;
//     const validChars = /^[a-zA-Z0-9\s.,!?'-]+$/;

//     // Validation
//     if (!skillname || skillname.length < 2 || skillname.length > 50) {
//       return res.status(400).json({ error: "Invalid skill name" });
//     }
//     if (!skilldesc || skilldesc.length < 10 || skilldesc.length > 500) {
//       return res.status(400).json({ error: "Invalid description" });
//     }
//     if (!category || category.length < 2 || category.length > 30) {
//       return res.status(400).json({ error: "Invalid category" });
//     }

//     if (
//       !validChars.test(skillname) ||
//       !validChars.test(skilldesc) ||
//       !validChars.test(category) 
//     ) {
//       return res.status(400).json({ error: "Invalid characters detected" });
//     }

//     const imageUrl = req.file.path;       // ✅ Cloudinary secure URL
//     const publicId = req.file.public_id;  // ✅ Correct field

//     await db.query(
//       `
//       INSERT INTO skills
//       (title, description, category, level, user_id, skill_img, skill_img_public_id, youtubelink, learningpoint)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//       `,
//       [
//         skillname,
//         skilldesc,
//         category,
//         skilllevel,
//         req.user.id,
//         imageUrl,
//         publicId,
//         youtube_link,
//         learningPoints
//       ]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Skill created successfully",
//       imageUrl,
//     });
//   } catch (error) {
//     console.error("Error creating skill:", error);
//     res.status(500).json({
//       success: false,
//       error: "Server error",
//     });
//   }
// };


exports.createSkill = async (req, res) => {
  try {
    // ✅ Check user auth
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Check image
    if (!req.file) {
      return res.status(400).json({ error: "Skill image is required" });
    }

    // ✅ Destructure form fields
    let { skillname, skilldesc, category, skilllevel, youtube_link, learningPoints, portfolio } = req.body;

    // If learningPoints comes as string (from FormData), try to parse JSON array
    if (typeof learningPoints === "string") {
      try {
        learningPoints = JSON.parse(learningPoints);
      } catch (e) {
        learningPoints = [learningPoints]; // fallback as single string
      }
    }

    // Validation rules
    const validChars = /^[a-zA-Z0-9\s.,!?'-]+$/;

    if (!skillname || skillname.length < 2 || skillname.length > 50) {
      return res.status(400).json({ error: "Invalid skill name" });
    }
    if (!skilldesc || skilldesc.length < 10 || skilldesc.length > 500) {
      return res.status(400).json({ error: "Invalid description" });
    }
    if (!category || category.length < 2 || category.length > 30) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (skilllevel && !["Beginner", "Intermediate", "Professional"].includes(skilllevel)) {
      return res.status(400).json({ error: "Invalid skill level" });
    }
    if (!validChars.test(skillname) || !validChars.test(skilldesc) || !validChars.test(category)) {
      return res.status(400).json({ error: "Invalid characters detected" });
    }

    // Optional: validate YouTube link format
    if (youtube_link && !/^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/.test(youtube_link)) {
      return res.status(400).json({ error: "Invalid YouTube link" });
    }

    // Optional: validate learningPoints array
    if (!Array.isArray(learningPoints)) learningPoints = [];
    learningPoints = learningPoints.map((point) => point.trim()).filter((point) => point.length > 0);

    // ✅ Image URLs
    const imageUrl = req.file.path;       // Cloudinary secure URL
    const publicId = req.file.public_id;  // Cloudinary public ID

    // ✅ Insert into DB
    await db.query(
      `
      INSERT INTO skills
      (title, description, category, level, user_id, skill_img, skill_img_public_id, youtubelink, learningpoint, portfolio_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        skillname,
        skilldesc,
        category,
        skilllevel,
        req.user.id,
        imageUrl,
        publicId,
        youtube_link || null,
        JSON.stringify(learningPoints), // save array as JSON string
        portfolio
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Skill created successfully",
      imageUrl,
      youtube_link: youtube_link || null,
      learningPoints,
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
