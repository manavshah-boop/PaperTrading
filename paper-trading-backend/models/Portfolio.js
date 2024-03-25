const connection = require("../db");

const Portfolio = {};

Portfolio.create = (userId, symbol, quantity, averagePrice, callback) => {
  const sql =
    "INSERT INTO portfolios (user_id, symbol, quantity, average_price) VALUES (?, ?, ?, ?)";
  connection.query(
    sql,
    [userId, symbol, quantity, averagePrice],
    (err, result) => {
      if (err) return callback(err, null);
      return callback(null, result);
    }
  );
};

Portfolio.findByUserId = (userId, callback) => {
  const sql = "SELECT * FROM portfolios WHERE user_id = ?";
  connection.query(sql, [userId], (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

module.exports = Portfolio;
