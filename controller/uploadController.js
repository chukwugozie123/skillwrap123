// const db = require("../modules/db")
// const cloudinary = require("../utils/cloundinary")

// exports.uploadProfile = async (req, res) => {
//     cloudinary.uploader.upload(req.file.path, async function (err, result){
//      if (!req.file) return res.status(400).json({error: "no file uploaded"})
          
//          const id = req.user.id
//          const filepath = req.file.filename    

//         await db.query("UPDATE users SET img_url= $1 WHERE id = $2", [filepath, id])
//         res.json({
//             succes: true,
//             message: "succesfully updated profile picture",
//             filename: req.file.filename
//         })
//         console.log(filepath)   
//     })
//     try {
        
//     } catch (error) {
//         res.status(500).json({error: error.message})
//     }
// }



const db = require("../modules/db");

exports.uploadProfile = async (req, res) => {
  try {
    // 🔐 Auth guard
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🖼️ File guard
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user.id;

    // ✅ CORRECT Cloudinary fields
    const imageUrl = req.file.path;
    const publicId = req.file.public_id;

    console.log("image:", req.file.public_id);
    console.log(imageUrl)


    await db.query(
      `
      UPDATE users
      SET img_url = $1,
          img_public_id = $2
      WHERE id = $3
      `,
      [imageUrl, publicId, userId]
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated profile picture",
      imageUrl,
    });
  } catch (error) {
    console.error("Upload profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
    });
  }
};
