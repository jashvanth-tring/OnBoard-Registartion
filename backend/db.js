const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1979",
  database: "onboarding_db"
});

db.connect((err) => {
  if (err)
    console.log("db failed:", err.message);
  else
    console.log("db connected");
});

module.exports = db;