const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const connection = require("./db");
const Portfolio = require("./models/Portfolio");
const cors = require("cors");


const app = express();
app.use(cors());
const PORT = 3000;
const path = require("path");

require('dotenv').config();

app.use(bodyParser.json());
app.use(cors()); // Use CORS middleware
const User = require("./models/User");
const { env } = require("process");
const e = require("express");
const apiKey = process.env.API_KEY;
// Middleware
app.use(bodyParser.json());
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, "secretKey", (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const getLatestCryptoPrice = async (symbol) => {
  try {
    const url = process.env.API_URL + symbol + "/USD";

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: url,
      headers: {
        Accept: "application/json",
        "X-CoinAPI-Key": apiKey,
      },
    };

    const response = await axios(config);
    return response.data.rate;
  } catch (error) {
    console.error("Error fetching price:", error.message);
    throw new Error("Failed to fetch cryptocurrency price");
  }
};

// Routes
app.post("/register", async (req, res) => {
  try {
    const { username, password, investment } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    User.create(username, hashedPassword, investment, (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).json({ error: "Failed to register user" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login Form Data:", { username, password }); // Check form data
    User.findByUsername(username, async (err, user) => {
      if (err) {
        console.error("Error finding user:", err);
        return res.status(500).json({ error: "Failed to login" });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id }, "secretKey", {
        expiresIn: "1h",
      });
      res.json({ token });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.get("/portfolio", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    Portfolio.findByUserId(userId, (err, portfolio) => {
      if (err) {
        console.error("Error fetching portfolio:", err);
        return res.status(500).json({ error: "Failed to fetch portfolio" });
      }
      res.json(portfolio);
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

app.post("/buy", authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.userId;

    const price = await getLatestCryptoPrice(symbol);
    const totalCost = price * quantity;

    // Check if the user has sufficient buying power
    User.getBuyingPower(userId, (err, buyingPower) => {
      if (err) {
        console.error("Error fetching buying power:", err);
        return res.status(500).json({ error: "Failed to buy cryptocurrency" });
      }

      if (buyingPower < totalCost) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      // Proceed with buying if sufficient funds
      User.decreaseBuyingPower(userId, totalCost, (err) => {
        if (err) {
          console.error("Error updating buying power:", err);
          return res.status(500).json({ error: "Failed to buy cryptocurrency" });
        }
      });
      let sql = "SELECT * FROM portfolios WHERE user_id = ? AND symbol = ?";
      connection.query(sql, [userId, symbol], (err, results) => {
        if (err) {
          console.error("Error checking portfolio:", err);
          return res.status(500).json({ error: "Failed to buy cryptocurrency" });
        }

        let newQuantity = quantity;
        let newAveragePrice = price;

        if (results.length > 0) {
          // Update portfolio if cryptocurrency already exists
          const existingQuantity = results[0].quantity;
          const existingAveragePrice = results[0].average_price;
          newQuantity += existingQuantity;
          newAveragePrice =
            (existingQuantity * existingAveragePrice + quantity * price) /
            newQuantity;

          sql =
            "UPDATE portfolios SET quantity = ?, average_price = ? WHERE user_id = ? AND symbol = ?";
          connection.query(
            sql,
            [newQuantity, newAveragePrice, userId, symbol],
            (err, result) => {
              if (err) {
                console.error("Error updating portfolio:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to buy cryptocurrency" });
              }
              res
                .status(201)
                .json({ message: "Cryptocurrency bought successfully" });
            }
          );
        } else {
          // Create new portfolio entry if cryptocurrency does not exist
          sql =
            "INSERT INTO portfolios (user_id, symbol, quantity, average_price) VALUES (?, ?, ?, ?)";
          connection.query(
            sql,
            [userId, symbol, newQuantity, newAveragePrice],
            (err, result) => {
              if (err) {
                console.error("Error creating portfolio:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to buy cryptocurrency" });
              }
              res
                .status(201)
                .json({ message: "Cryptocurrency bought successfully" });
            }
          );
        }
      });
    });
  } catch (error) {
    console.error("Error buying cryptocurrency:", error);
    res.status(500).json({ error: "Failed to buy cryptocurrency" });
  }
});

app.post("/sell", authenticateToken, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user.userId;
    console.log(symbol);
    const price = await getLatestCryptoPrice(symbol);

    // Check if the user has the required amount of cryptocurrency in the portfolio
    const sql = "SELECT * FROM portfolios WHERE user_id = ? AND symbol = ?";
    connection.query(sql, [userId, symbol], (err, results) => {
      if (err) {
        console.error("Error checking portfolio:", err);
        return res.status(500).json({ error: "Failed to sell cryptocurrency" });
      }

      if (results.length === 0 || results[0].quantity < quantity) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Calculate total sale amount
      const totalSaleAmount = price * quantity;

      // Update portfolio with new quantity
      const newQuantity = results[0].quantity - quantity;
      if (newQuantity === 0) {
        // Remove portfolio entry if quantity becomes zero
        const deleteSql =
          "DELETE FROM portfolios WHERE user_id = ? AND symbol = ?";
        connection.query(deleteSql, [userId, symbol], (err, result) => {
          if (err) {
            console.error("Error deleting portfolio:", err);
            return res
              .status(500)
              .json({ error: "Failed to sell cryptocurrency" });
          }

          // Update buying power after successful sale
          User.updateBuyingPower(userId, totalSaleAmount, (err) => {
            if (err) {
              console.error("Error updating buying power:", err);
              return res
                .status(500)
                .json({ error: "Failed to sell cryptocurrency" });
            }
            res.json({ message: "Cryptocurrency sold successfully" });
          });
        });
      } else {
        const updateSql =
          "UPDATE portfolios SET quantity = ? WHERE user_id = ? AND symbol = ?";
        connection.query(
          updateSql,
          [newQuantity, userId, symbol],
          (err, result) => {
            if (err) {
              console.error("Error updating portfolio:", err);
              return res
                .status(500)
                .json({ error: "Failed to sell cryptocurrency" });
            }

            // Update buying power after successful sale
            User.updateBuyingPower(userId, totalSaleAmount, (err) => {
              if (err) {
                console.error("Error updating buying power:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to sell cryptocurrency" });
              }
              res.json({ message: "Cryptocurrency sold successfully" });
            });
          }
        );
      }
    });
  } catch (error) {
    console.error("Error selling cryptocurrency:", error);
    res.status(500).json({ error: "Failed to sell cryptocurrency" });
  }
});


app.get("/buying_power", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    User.getBuyingPower(userId, (err, buyingPower) => {
      if (err) {
        console.error("Error fetching buying power:", err);
        return res.status(500).json({ error: "Failed to fetch buying power" });
      }
      res.json({ buyingPower });
    });
  } catch (error) {
    console.error("Error fetching buying power:", error);
    res.status(500).json({ error: "Failed to fetch buying power" });
  }
});

app.get("/symbols", async (req, res) => {
  try {
    const symbolurl = env.API_SYMBOL_URL + 'symbols';

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: url,
      headers: {
        Accept: "text/json",
        "X-CoinAPI-Key": apiKey,
      },
    };

    const response = await axios(config);
    const allSymbols = response.data.map(asset => asset.asset_id);
    const allSymbolsNames = response.data.map(asset => asset.name);
    
    // Send the symbols array as JSON response
    res.json({ allSymbols, allSymbolsNames });

  } catch (error) {
    console.error("Error fetching symbols:", error.message);
    // Send an error response
    res.status(500).json({ error: "Failed to fetch cryptocurrency symbols" });
  }
});





// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
