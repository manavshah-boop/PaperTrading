const connection = require("../db");

const User = {};

User.create = (username, password, investment, callback) => {
  const sql = "INSERT INTO users (username, password, buying_power) VALUES (?, ?, ?)";
  connection.query(sql, [username, password, investment], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, result);
  });
};

User.findByUsername = (username, callback) => {
  const sql = "SELECT * FROM users WHERE username = ?";
  connection.query(sql, [username], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null);
    return callback(null, results[0]);
  });
};

User.findByUserId = (userId, callback) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  connection.query(sql, [userId], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null);
    return callback(null, results);
  });
};

User.getBuyingPower = (userId, callback) => {
  const sql = "SELECT buying_power FROM users WHERE id = ?";
  connection.query(sql, [userId], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null);
    return callback(null, results[0].buying_power);
  });
};

User.updateBuyingPower = (userId, buyingPower, callback) => {
  const sql = "UPDATE users SET buying_power = buying_power + ? WHERE id = ?";
  connection.query(sql, [buyingPower, userId], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, result);
  });
};

User.decreaseBuyingPower = (userId, amount, callback) => {
  const sql = "UPDATE users SET buying_power = buying_power - ? WHERE id = ?";
  connection.query(sql, [amount, userId], (err, result) => {
    if (err) return callback(err, null);
    return callback(null, result);
  });
}

module.exports = User;
