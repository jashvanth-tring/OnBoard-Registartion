const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const upload = require('./upload');

const app = express();
app.use(cors());
app.use("/uploads", express.static("uploads"));

const port = 5000;

function removeFolder(req) {
  if (req.folderName) {
    fs.rmSync(path.join("uploads", req.folderName), { recursive: true, force: true });
  }
}

function fail(req, res, status, message) {
  removeFolder(req);
  return res.status(status).json({ message: message });
}

function esc(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

app.get("/", (req, res) => {
  res.send("server is running");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err)
      return res.send("Database not connected " + err.message);
    res.send("connected");
  });
});

app.post("/register", (req, res) => {
  upload(req, res, (err) => {
    if (err)
      return fail(req, res, 400, err.message);

    const body = req.body;
    const files = req.files || {};

    const required = [
      "fullName", "dob", "gender", "email", "mobile", "altMobile",
      "fatherName", "motherName", "maritalStatus", "bloodGroup",
      "tenthSchool", "tenthPercentage", "twelfthSchool", "twelfthPercentage",
      "collegeName", "cgpa", "marksheetCount",
      "bankName", "accountNo", "ifsc", "branch"
    ];

    for (let i = 0; i < required.length; i++) {
      if (!body[required[i]]) {
        return fail(req, res, 400, required[i] + " is required");
      }
    }

    if (body.mobile.length !== 10 || isNaN(body.mobile)) {
      return fail(req, res, 400, "Mobile must be 10 digits");
    }
    if (body.altMobile.length !== 10 || isNaN(body.altMobile)) {
      return fail(req, res, 400, "Alternate mobile must be 10 digits");
    }
    if (body.mobile === body.altMobile) {
      return fail(req, res, 400, "Mobile and alternate mobile must not be the same");
    }
    if (body.tenthPercentage < 0 || body.tenthPercentage > 100) {
      return fail(req, res, 400, "10th percentage must be 0 to 100");
    }
    if (body.twelfthPercentage < 0 || body.twelfthPercentage > 100) {
      return fail(req, res, 400, "12th percentage must be 0 to 100");
    }
    if (body.cgpa < 0 || body.cgpa > 10) {
      return fail(req, res, 400, "CGPA must be 0 to 10");
    }
    if (body.accountNo.length < 9 || body.accountNo.length > 18 || isNaN(body.accountNo)) {
      return fail(req, res, 400, "Account number must be 9 to 18 digits");
    }
    if (body.ifsc.length !== 11) {
      return fail(req, res, 400, "IFSC must be 11 characters");
    }
    if (body.agree !== "true") {
      return fail(req, res, 400, "You must agree to join");
    }

    const requiredFiles = [
      "photo", "signature", "aadhar", "pan",
      "tenthMarksheet", "twelfthMarksheet", "passbook", "offerLetter"
    ];
    for (let i = 0; i < requiredFiles.length; i++) {
      if (!files[requiredFiles[i]]) {
        return fail(req, res, 400, requiredFiles[i] + " file is required");
      }
    }

    const jpgFiles = ["photo", "signature", "aadhar", "pan", "passport"];
    for (let i = 0; i < jpgFiles.length; i++) {
      const name = jpgFiles[i];
      if (files[name] && files[name][0].mimetype !== "image/jpeg") {
        return fail(req, res, 400, name + " must be a JPG file");
      }
    }

    const count = Number(body.marksheetCount);
    const collegeFiles = files.collegeMarksheets || [];
    if (collegeFiles.length !== count) {
      return fail(req, res, 400, "Please upload exactly " + count + " college marksheet(s)");
    }

    function getFile(name) {
      if (files[name]) {
        return files[name][0].filename;
      }
      return null;
    }

    const collegeNames = [];
    for (let i = 0; i < collegeFiles.length; i++) {
      collegeNames.push(collegeFiles[i].filename);
    }

    const record = {
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
      photo: getFile("photo"),
      signature: getFile("signature"),
      aadhar: getFile("aadhar"),
      pan: getFile("pan"),
      passport: getFile("passport"),
      tenth_school: body.tenthSchool,
      tenth_percentage: body.tenthPercentage,
      tenth_marksheet: getFile("tenthMarksheet"),
      twelfth_school: body.twelfthSchool,
      twelfth_percentage: body.twelfthPercentage,
      twelfth_marksheet: getFile("twelfthMarksheet"),
      college_name: body.collegeName,
      cgpa: body.cgpa,
      college_marksheets: collegeNames.join(","),
      bank_name: body.bankName,
      account_no: body.accountNo,
      ifsc: body.ifsc,
      branch: body.branch,
      passbook: getFile("passbook"),
      offer_letter: getFile("offerLetter"),
      agreed: true,
      folder: req.folderName
    };

    db.query("INSERT INTO registrations SET ?", record, (error, result) => {
      if (error) {
        console.log(error);
        if (error.code === "ER_DUP_ENTRY") {
          return fail(req, res, 400, "This email or mobile is already registered");
        }
        return fail(req, res, 500, "Database error, please try again");
      }
      res.json({ message: "Registration saved successfully", id: result.insertId });
    });
  });
});

app.get("/view", (req, res) => {
  db.query("SELECT id, full_name, email, folder FROM registrations ORDER BY id DESC", (err, rows) => {
    if (err)
      return res.status(500).send("Database error");

    let html = "<h2>All Registrations</h2><ul>";
    for (let i = 0; i < rows.length; i++) {
      html += '<li><a href="/view/' + rows[i].id + '">' + esc(rows[i].full_name) + "</a> (" + esc(rows[i].email) + ")</li>";
    }
    html += "</ul>";
    res.send(html);
  });
});

app.get("/view/:id", (req, res) => {
  db.query("SELECT * FROM registrations WHERE id = ?", [req.params.id], (err, rows) => {
    if (err)
      return res.status(500).send("Database error");
    if (rows.length === 0)
      return res.status(404).send("Registration not found");

    const r = rows[0];
    const base = "/uploads/" + r.folder + "/";

    let html = "<h2>" + esc(r.full_name) + "</h2>";
    html += "<p>Email: " + esc(r.email) + " | Mobile: " + esc(r.mobile) + "</p>";
    html += '<img src="' + base + r.photo + '" width="150"><br><br>';

    const labels = {
      signature: "Signature",
      aadhar: "Aadhar",
      pan: "PAN",
      passport: "Passport",
      tenth_marksheet: "10th Marksheet",
      twelfth_marksheet: "12th Marksheet",
      passbook: "Bank Passbook",
      offer_letter: "Offer Letter"
    };

    html += "<ul>";
    for (let key in labels) {
      if (r[key]) {
        html += '<li><a href="' + base + r[key] + '" target="_blank">' + labels[key] + "</a></li>";
      }
    }

    const college = r.college_marksheets ? r.college_marksheets.split(",") : [];
    for (let i = 0; i < college.length; i++) {
      html += '<li><a href="' + base + college[i] + '" target="_blank">College Marksheet ' + (i + 1) + "</a></li>";
    }
    html += "</ul>";

    res.send(html);
  });
});

app.listen(port, () => {
  console.log("node server running on port " + port);
});