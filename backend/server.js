
const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const db = require('./db');
const upload = require('./upload');

const app = express();
const port = Number(process.env.PORT) || 5000;
const uploadDirectory = path.join(__dirname, 'uploads');

app.disable('x-powered-by');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

function removeFolder(req) {
  if (req.folderName) {
    const folderPath = path.join(uploadDirectory, req.folderName);

    if (path.dirname(folderPath) === uploadDirectory) {
      fs.rmSync(folderPath, {
        recursive: true,
        force: true
      });
    }
  }
}

function fail(req, res, status, message) {
  removeFolder(req);
  return res.status(status).json({ message });
}

function isEmpty(value) {
  return value === undefined ||
    value === null ||
    String(value).trim() === '';
}

function isValidRange(value, min, max) {
  if (isEmpty(value)) {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) &&
    number >= min &&
    number <= max;
}

function isDigits(value, minLength, maxLength = minLength) {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.length < minLength || value.length > maxLength) {
    return false;
  }

  for (const character of value) {
    if (character < '0' || character > '9') {
      return false;
    }
  }

  return true;
}

function isValidEmail(value) {
  if (typeof value !== 'string' || value.length > 254) {
    return false;
  }

  const atIndex = value.indexOf('@');

  if (
    atIndex <= 0 ||
    atIndex !== value.lastIndexOf('@') ||
    atIndex === value.length - 1
  ) {
    return false;
  }

  const localPart = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf('.');

  return localPart.length <= 64 &&
    !/\s/.test(localPart) &&
    !/\s/.test(domain) &&
    dotIndex > 0 &&
    dotIndex < domain.length - 1;
}

function validateRequired(body) {
  const required = [
    'fullName', 'dob', 'gender', 'email', 'mobile', 'altMobile',
    'fatherName', 'motherName', 'maritalStatus', 'bloodGroup',
    'tenthSchool', 'tenthPercentage', 'twelfthSchool',
    'twelfthPercentage', 'collegeName', 'cgpa', 'marksheetCount',
    'bankName', 'accountNo', 'ifsc', 'branch'
  ];

  for (const field of required) {
    if (isEmpty(body[field])) {
      return field + ' is required';
    }
  }

  return null;
}

function validatePersonal(body) {
  if (!isDigits(body.mobile, 10)) {
    return 'Mobile must be 10 digits';
  }

  if (!isDigits(body.altMobile, 10)) {
    return 'Alternate mobile must be 10 digits';
  }

  if (body.mobile === body.altMobile) {
    return 'Mobile and alternate mobile must not be the same';
  }

  if (!isValidEmail(body.email)) {
    return 'Enter a valid email';
  }

  if (
    typeof body.dob !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.dob)
  ) {
    return 'Enter a valid date of birth';
  }

  const date = new Date(body.dob);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== body.dob
  ) {
    return 'Enter a valid date of birth';
  }

  if (!['Male', 'Female', 'Other'].includes(body.gender)) {
    return 'Select a valid gender';
  }

  if (!['Single', 'Married', 'Divorced'].includes(body.maritalStatus)) {
    return 'Select a valid marital status';
  }

  if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(body.bloodGroup)) {
    return 'Select a valid blood group';
  }

  return null;
}

function validateEducation(body) {
  if (!isValidRange(body.tenthPercentage, 0, 100)) {
    return '10th percentage must be 0 to 100';
  }

  if (!isValidRange(body.twelfthPercentage, 0, 100)) {
    return '12th percentage must be 0 to 100';
  }

  if (!isValidRange(body.cgpa, 0, 10)) {
    return 'CGPA must be 0 to 10';
  }

  if (!isDigits(String(body.marksheetCount), 1) ||
      Number(body.marksheetCount) < 1 ||
      Number(body.marksheetCount) > 8) {
    return 'Marksheet count must be 1 to 8';
  }

  return null;
}

function validateBank(body) {
  if (!isDigits(body.accountNo, 9, 18)) {
    return 'Account number must be 9 to 18 digits';
  }

  const ifsc = typeof body.ifsc === 'string' ? body.ifsc : '';

  if (
    ifsc.length !== 11 ||
    !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifsc)
  ) {
    return 'Enter a valid 11-character IFSC code';
  }

  if (body.agree !== 'true') {
    return 'You must agree to join';
  }

  return null;
}

function validateFiles(body, files) {
  const requiredFiles = [
    'photo', 'signature', 'aadhar', 'pan',
    'tenthMarksheet', 'twelfthMarksheet',
    'passbook', 'offerLetter'
  ];

  for (const name of requiredFiles) {
    if (!files[name]?.[0]) {
      return name + ' file is required';
    }
  }

  const count = Number(body.marksheetCount);
  const collegeFiles = files.collegeMarksheets || [];

  if (collegeFiles.length !== count) {
    return 'Please upload exactly ' + count + ' college marksheet(s)';
  }

  return null;
}

function validateRegistration(body, files) {
  return validateRequired(body) ||
    validatePersonal(body) ||
    validateEducation(body) ||
    validateBank(body) ||
    validateFiles(body, files);
}

function getFile(files, name) {
  return files[name]?.[0]?.filename || null;
}

function buildRecord(body, files, folderName) {
  const collegeFiles = files.collegeMarksheets || [];

  return {
    full_name: body.fullName,
    dob: body.dob,
    gender: body.gender,
    email: body.email,
    mobile: body.mobile,
    alt_mobile: body.altMobile,
    father_name: body.fatherName,
    mother_name: body.motherName,
    marital_status: body.maritalStatus,
    blood_group: body.bloodGroup,
    photo: getFile(files, 'photo'),
    signature: getFile(files, 'signature'),
    aadhar: getFile(files, 'aadhar'),
    pan: getFile(files, 'pan'),
    passport: getFile(files, 'passport'),
    tenth_school: body.tenthSchool,
    tenth_percentage: Number(body.tenthPercentage),
    tenth_marksheet: getFile(files, 'tenthMarksheet'),
    twelfth_school: body.twelfthSchool,
    twelfth_percentage: Number(body.twelfthPercentage),
    twelfth_marksheet: getFile(files, 'twelfthMarksheet'),
    college_name: body.collegeName,
    cgpa: Number(body.cgpa),
    college_marksheets: collegeFiles.map(file => file.filename).join(','),
    bank_name: body.bankName,
    account_no: body.accountNo,
    ifsc: body.ifsc.toUpperCase(),
    branch: body.branch,
    passbook: getFile(files, 'passbook'),
    offer_letter: getFile(files, 'offerLetter'),
    agreed: true,
    folder: folderName
  };
}

app.get('/', (req, res) => {
  res.send('server is running');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1', err => {
    if (err) {
      return res.status(500).send('Database not connected');
    }

    return res.send('connected');
  });
});

app.post('/register', (req, res) => {
  upload(req, res, err => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Each file must be 5 MB or smaller'
        : err.message;

      return fail(req, res, 400, message);
    }

    const body = req.body || {};
    const files = req.files || {};
    const validationError = validateRegistration(body, files);

    if (validationError) {
      return fail(req, res, 400, validationError);
    }

    const record = buildRecord(body, files, req.folderName);

    db.query('INSERT INTO registrations SET ?', record, (error, result) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return fail(req, res, 400, 'This email or mobile is already registered');
        }

        console.error('Registration database operation failed');
        return fail(req, res, 500, 'Database error, please try again');
      }

      return res.status(201).json({
        message: 'Registration saved successfully',
        id: result.insertId
      });
    });
  });
});

module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log('Node server running on port ' + port);
  });
}
