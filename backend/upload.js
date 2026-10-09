const multer = require('multer');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync("uploads"))
  fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.folderName) {
      const name = (req.body.fullName || "user").trim().replace(/[^a-zA-Z0-9]+/g, "_") || "user";
      req.folderName = name + "_" + Date.now();
      fs.mkdirSync(path.join("uploads", req.folderName), { recursive: true });
    }
    cb(null, path.join("uploads", req.folderName));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === "collegeMarksheets") {
      req.collegeCount = (req.collegeCount || 0) + 1;
      cb(null, "collegeMarksheet" + req.collegeCount + ext);
    } else {
      cb(null, file.fieldname + ext);
    }
  }
});


const upload = multer({ storage: storage }).fields([
  { name: "photo", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
  { name: "pan", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "tenthMarksheet", maxCount: 1 },
  { name: "twelfthMarksheet", maxCount: 1 },
  { name: "passbook", maxCount: 1 },
  { name: "offerLetter", maxCount: 1 },
  { name: "collegeMarksheets", maxCount: 8 }
]);

module.exports = upload;