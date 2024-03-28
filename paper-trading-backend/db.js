const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "papertrading.mysql.database.azure.com",
  user: "manavs",
  password: "Vinny#2002",
  database: "data",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = connection;
