// const multer = require("multer");

// // ✅ Configure multer
// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage });

// module.exports = upload





// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ensure upload folder exists
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueName + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (!file.mimetype.startsWith("image/")) {
//     cb(new Error("Only image files allowed"), false);
//   } else {
//     cb(null, true);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// module.exports = upload;










// // const multer = require("multer");
// // const path = require("path");
// // const fs = require("fs");

// // // ✅ Configure multer with dynamic destination
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     let uploadPath = "uploads/skills"; // default

// //     // Determine which route or purpose is uploading
// //     if (req.originalUrl.includes("upload-profile")) {
// //       uploadPath = "uploads";
// //     } else if (req.originalUrl.includes("create-skill")) {
// //       uploadPath = "uploads";
// //     }

// //     // Ensure directory exists
// //     fs.mkdirSync(uploadPath, { recursive: true });

// //     cb(null, uploadPath);
// //   },

// //   filename: (req, file, cb) => {
// //     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
// //     cb(null, uniqueSuffix + path.extname(file.originalname));
// //   },
// // });

// // const upload = multer({ storage });

// // module.exports = upload;



const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skillwrap/profile_pictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: () => `skill-${Date.now()}`,
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
