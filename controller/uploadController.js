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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user.id;

    // multer-storage-cloudinary already uploaded the image
    const imageUrl = req.file.path;       // Cloudinary secure URL
    const publicId = req.file.filename;   // Cloudinary public_id

    await db.query(
      "UPDATE users SET img_url = $1 WHERE id = $2",
      [imageUrl, userId]
    );

    res.status(200).json({
      success: true,
      message: "Successfully updated profile picture",
      imageUrl,
      publicId,
    });
  } catch (error) {
    console.error("Upload profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
    });
  }
};
