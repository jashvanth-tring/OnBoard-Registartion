const multer = require('multer');
const fs = require('node:fs');
const path = require('node:path');

const uploadDirectory = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const allowedTypes = {
  photo: ['image/jpeg'],
  signature: ['image/jpeg'],
  aadhar: ['image/jpeg'],
  pan: ['image/jpeg'],
  passport: ['image/jpeg'],
  tenthMarksheet: ['image/jpeg', 'application/pdf'],
  twelfthMarksheet: ['image/jpeg', 'application/pdf'],
  passbook: ['image/jpeg', 'application/pdf'],
  offerLetter: ['image/jpeg', 'application/pdf'],
  collegeMarksheets: ['image/jpeg', 'application/pdf']
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.folderName) {
      const name = String(req.body.fullName || 'user')
        .trim()
        .replaceAll(/[^a-zA-Z0-9]+/g, '_') || 'user';

      req.folderName = name + '_' + Date.now();

      fs.mkdirSync(
        path.join(uploadDirectory, req.folderName),
        { recursive: true }
      );
    }

    cb(null, path.join(uploadDirectory, req.folderName));
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === 'collegeMarksheets') {
      req.collegeCount = (req.collegeCount || 0) + 1;
      return cb(null, 'collegeMarksheet' + req.collegeCount + ext);
    }

    cb(null, file.fieldname + ext);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 16,
    fields: 30,
    parts: 50
  },

  fileFilter: (req, file, cb) => {
    const types = allowedTypes[file.fieldname];

    if (!types) {
      return cb(new Error('Unexpected file field'));
    }

    if (!types.includes(file.mimetype)) {
      return cb(new Error('Invalid file type for ' + file.fieldname));
    }

    cb(null, true);
  }
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'passport', maxCount: 1 },
  { name: 'tenthMarksheet', maxCount: 1 },
  { name: 'twelfthMarksheet', maxCount: 1 },
  { name: 'passbook', maxCount: 1 },
  { name: 'offerLetter', maxCount: 1 },
  { name: 'collegeMarksheets', maxCount: 8 }
]);

module.exports = upload;