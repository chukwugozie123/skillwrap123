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


//one skill

exports.oneskill = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.category,
        s.level,
        s.skill_img,
        s.created_at,

        u.id AS user_id,
        u.username,
        u.fullname

      FROM skills s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    res.status(200).json({
      success: true,
      skill: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error fetching skill:", err);
    res.status(500).json({ success: false, message: "Server error" });
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
  const {skillId} = req.params
  try {
     await db.query("DELETE FROM skills WHERE id = $1", [skillId]);
        
     res.json({
        success: true,
        message: "Deleted succesfully"
      });
  } catch (error) {
    console.error("delete-skill error:", error);
    res.status(500).json({ success: false, error: "Failed to delete skill." });
  }
}

// //  Create Skill
// exports.createSkill = async (req, res) => {
//   if (!req.body) {
//     return res.status(400).json({ error: "Form data is missing" });
//   }

//  if (!req.file) return res.status(400).json({error: "skill imag is requried"})



//   const { skillname, skilldesc, category, skilllevel } = req.body;
//   const validChars = /^[a-zA-Z0-9\s.,!?'-]+$/;

//   // Validation
//   if (skillname.length < 2 || skillname.length > 50) {
//     return res.status(400).json({ error: "Skill name must be between 2 and 50 characters." });
//   }
//   if (!validChars.test(skillname)) {
//     return res.status(400).json({ error: "Skill name has invalid characters." });
//   }
//   if (skilldesc.length < 10 || skilldesc.length > 500) {
//     return res.status(400).json({ error: "Description must be between 10 and 500 characters." });
//   }
//   if (!validChars.test(skilldesc)) {
//     return res.status(400).json({ error: "Description has invalid characters." });
//   }
//   if (category.length < 2 || category.length > 30) {
//     return res.status(400).json({ error: "Category must be between 2 and 30 characters." });
//   }
//   if (!validChars.test(category)) {
//     return res.status(400).json({ error: "Category has invalid characters." });
//   }

//   const user_id = req.user?.id || null;
//   const imagepath = req.file || req.file.filename;

//   try {
//     await db.query(
//       "INSERT INTO skills (title, description, category, level, user_id, skill_img) VALUES ($1, $2, $3, $4, $5, $6)",
//       [skillname, skilldesc, category, skilllevel, user_id, imagepath]
//     );

//     res.status(201).json({
//       success: true,
//       message: "A new skill was added successfully.",
//       img_url: `/uploads/skills/${imagepath}`,
//     });
//   } catch (error) {
//     console.error("Error creating skill:", error);
//     res.status(500).json({
//       success: false,
//       error: "Database error. Please try again.",
//     });
//   }
// };





























// Controller: createSkill.js
exports.createSkill = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Form data is missing" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Skill image is required" });
    }

    const { skillname, skilldesc, category, skilllevel } = req.body;
    const validChars = /^[a-zA-Z0-9\s.,!?'-]+$/;

    // Validation
    if (skillname.length < 2 || skillname.length > 50) {
      return res.status(400).json({ error: "Skill name must be between 2 and 50 characters." });
    }
    if (!validChars.test(skillname)) {
      return res.status(400).json({ error: "Skill name has invalid characters." });
    }
    if (skilldesc.length < 10 || skilldesc.length > 500) {
      return res.status(400).json({ error: "Description must be between 10 and 500 characters." });
    }
    if (!validChars.test(skilldesc)) {
      return res.status(400).json({ error: "Description has invalid characters." });
    }
    if (category.length < 2 || category.length > 30) {
      return res.status(400).json({ error: "Category must be between 2 and 30 characters." });
    }
    if (!validChars.test(category)) {
      return res.status(400).json({ error: "Category has invalid characters." });
    }

    const user_id = req.user?.id || null;
    const imagepath = req.file.filename; // ✅ fixed

    await db.query(
      "INSERT INTO skills (title, description, category, level, user_id) VALUES ($1, $2, $3, $4, $5)",
      [skillname, skilldesc, category, skilllevel, user_id]
    );

    res.status(201).json({
      success: true,
      message: "A new skill was added successfully.",
      img_url: `/uploads/skills/${imagepath}`,
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({
      success: false,
      error: "Database error. Please try again.",
    });
  }
};
