// const db = require("../modules/db");

// exports.uploadProfile = async (req, res) => {
//   try {
//     /* 🔐 AUTH GUARD */
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         code: "UNAUTHORIZED",
//         message: "You must be logged in to upload a profile picture",
//       });
//     }

//     /* 🖼️ FILE GUARD */
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         code: "NO_FILE",
//         message: "No image file was uploaded",
//       });
//     }

//     const userId = req.user.id;

//     /* ☁️ CLOUDINARY FIELDS (SAFE) */
//     const imageUrl = req.file.path;
//     const publicId = req.file.filename || req.file.public_id;

//     if (!imageUrl || !publicId) {
//       return res.status(500).json({
//         success: false,
//         code: "UPLOAD_FAILED",
//         message: "Image upload failed. Please try again.",
//       });
//     }

//     /* 💾 DB UPDATE */
//     await db.query(
//       `
//       UPDATE users
//       SET img_url = $1,
//      WHERE id = $2
//       `,
//       [imageUrl, publicId, userId]
//     );
//     //  img_public_id = $2

//     /* ✅ SUCCESS */
//     return res.status(200).json({
//       success: true,
//       message: "Profile picture updated successfully",
//       imageUrl,
//     });

//   } catch (error) {
//     console.error("❌ Upload profile error:", error);

//     return res.status(500).json({
//       success: false,
//       code: "SERVER_ERROR",
//       message: "Something went wrong while uploading your profile picture",
//     });
//   }
// };



// const db = require("../modules/db");

// exports.uploadProfile = async (req, res) => {
//   try {
//     // 🔐 Auth guard
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     // 🖼️ File guard
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No file uploaded",
//       });
//     }

//     const userId = req.user.id;

//     // ✅ CORRECT Cloudinary fields
//     const imageUrl = req.file.path;
//     const publicId = req.file.public_id;

//     console.log("image:", req.file.public_id);
//     console.log(imageUrl)


//     await db.query(
//       `
//       UPDATE users
//       SET img_url = $1,
//           img_public_id = $2
//       WHERE id = $3
//       `,
//       [imageUrl, publicId, userId]
//     );

//     res.status(200).json({
//       success: true,
//       message: "Successfully updated profile picture",
//       imageUrl,
//     });
//   } catch (error) {
//     console.error("Upload profile error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to upload profile picture",
//     });
//   }
// };















const db = require("../modules/db");
const cloudinary = require("../utils/cloudinary");

exports.uploadProfile = async (req, res) => {
  try {
    /* 🔐 AUTH GUARD */
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "You must be logged in to upload a profile picture",
      });
    }

    /* 🖼️ FILE GUARD */
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: "NO_FILE",
        message: "No image file was uploaded",
      });
    }

    const userId = req.user.id;

    console.log("req.file:", req.file);
console.log("req.body:", req.body);


    /* ☁️ UPLOAD TO CLOUDINARY */
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "skillwrapp/profile",
    });

    if (!result.secure_url || !result.public_id) {
      return res.status(500).json({
        success: false,
        code: "UPLOAD_FAILED",
        message: "Image upload failed. Please try again.",
      });
    }

    const imageUrl = result.secure_url;
    const publicId = result.public_id;

    /* 💾 UPDATE DATABASE */
    await db.query(
      `
      UPDATE users
      SET img_url = $1,
          img_public_id = $2
      WHERE id = $3
      `,
      [imageUrl, publicId, userId]
    );

    console.log("req.file:", req.file);
console.log("req.body:", req.body);

    /* ✅ SUCCESS RESPONSE */
    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      imageUrl,
    });

    
  } catch (error) {
    console.error("❌ Upload profile error:", error);

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: "Something went wrong while uploading your profile picture",
    });
  }
};
