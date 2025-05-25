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

Portfolio.updateHoldings = (userId, symbol, quantity, averagePrice) => {
  const sql = "INSERT INTO portfolios (user_id, symbol, quantity, average_price) VALUES (?, ?, ?, ?)";
  return new Promise((resolve, reject) => {
    connection.query(sql, [userId, symbol, quantity, averagePrice], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

Portfolio.deleteByUserId = (userId, callback) => {
  const sql = "DELETE FROM portfolios WHERE user_id = ?";
  return new Promise((resolve, reject) => {
    connection.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

Portfolio.findQuantityBySymbol = (userId, symbol, callback) => {
  const sql = "SELECT quantity FROM portfolios WHERE user_id = ? AND symbol = ?";
  return new Promise((resolve, reject) => {
    connection.query(sql, [userId, symbol], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(0); // No holdings found
      resolve(results[0].quantity);
    });
  });
};

module.exports = Portfolio;
