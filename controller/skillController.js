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

    // ✅ GUARD
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill id",
      });
    }

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

    console.log("PARAM ID:", req.params.id);

    const result = await db.query(query, [Number(id)]);

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).json({
      success: true,
      skill: result.rows[0],
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

exports.createSkill = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Skill image is required" });
    }

    const { skillname, skilldesc, category, skilllevel } = req.body;
    const validChars = /^[a-zA-Z0-9\s.,!?'-]+$/;

    // Validation
    if (!skillname || skillname.length < 2 || skillname.length > 50) {
      return res.status(400).json({ error: "Invalid skill name" });
    }
    if (!skilldesc || skilldesc.length < 10 || skilldesc.length > 500) {
      return res.status(400).json({ error: "Invalid description" });
    }
    if (!category || category.length < 2 || category.length > 30) {
      return res.status(400).json({ error: "Invalid category" });
    }

    if (
      !validChars.test(skillname) ||
      !validChars.test(skilldesc) ||
      !validChars.test(category)
    ) {
      return res.status(400).json({ error: "Invalid characters detected" });
    }

    const imageUrl = req.file.path;       // ✅ Cloudinary secure URL
    const publicId = req.file.public_id;  // ✅ Correct field

console.log("FILE:", req.file.path);
console.log("image:", req.file.public_id);


    await db.query(
      `
      INSERT INTO skills
      (title, description, category, level, user_id, skill_img)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        skillname,
        skilldesc,
        category,
        skilllevel,
        req.user.id,
        imageUrl,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Skill created successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
