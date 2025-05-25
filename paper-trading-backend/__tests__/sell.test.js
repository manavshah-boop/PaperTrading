/*
 * File: __tests__/sell.test.js
 * Description: Tests for the /sell endpoint in the paper trading backend.
 * This file tests the functionality of selling cryptocurrencies, including
 * handling of authentication, sufficient holdings, and successful transactions.
 * Name: Manav Shah
 * Date: 2025-05-25
*/
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");
const db = require("../db");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");

const { getLatestCryptoPrice } = require("../utils/getLatestCryptoPrice");

jest.mock("../utils/getLatestCryptoPrice", () => ({ // Mock the getLatestCryptoPrice function
  getLatestCryptoPrice: jest.fn().mockResolvedValue(1000),
}));

describe("POST /sell", () => { 
  const testUsername = "sell_user_test";
  const testPassword = "testpass";
  let token;
  let userId;

  const symbol = "BTC";
  const initialQuantity = 1;

  const sellCrypto = async (quantity, authToken = token) => { // Helper function to process sell requests
    const req = request(app).post("/sell").send({ symbol, quantity });
    return authToken ? req.set("Authorization", `Bearer ${authToken}`) : req;
  };
  // Helper function to get the quantity of a specific symbol for the user
  const getQuantity = () => Portfolio.findQuantityBySymbol(userId, symbol);

  beforeEach(async () => {
    await Portfolio.deleteByUserId(userId);
    await User.deleteByUsername(testUsername);
    await User.create(testUsername, testPassword, 0); // Create a new test user

    const user = await User.findByUser(testUsername);
    userId = user.id;

    await Portfolio.updateHoldings(userId, symbol, initialQuantity, 1000); // Add initial holding

    token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  });

  afterAll(async () => {
    // Clean up the test user and portfolio
    // Portfolio must be deleted first to avoid foreign key constraint issues
    await Portfolio.deleteByUserId(userId);
    await User.deleteByUsername(testUsername);
    await db.end();
  });

  it("should reject if no token provided", async () => { // Test without token
    const res = await sellCrypto(0.5, null);
    expect(res.statusCode).toBe(401);
  });

  it("should reject if user doesn’t own the asset", async () => { // Test selling an asset not owned by the user
    const res = await request(app)
      .post("/sell")
      .set("Authorization", `Bearer ${token}`)
      .send({ symbol: "ETH", quantity: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Insufficient balance");
  });

  it("should reject if trying to sell more than owned", async () => { // Test selling more than the user owns
    const res = await sellCrypto(2);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Insufficient balance");
  });

  it("should sell part of the holding", async () => { // Test selling a portion of the holding
    const sellAmount = 0.5;

    const res = await sellCrypto(sellAmount);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cryptocurrency sold successfully");

    const remaining = await getQuantity();
    expect(remaining).toBeCloseTo(initialQuantity - sellAmount);
  });

  it("should sell full holding and delete the portfolio entry", async () => { // Test selling the entire holding
    const res = await sellCrypto(initialQuantity);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Cryptocurrency sold successfully");

    const remaining = await getQuantity();
    expect(remaining).toBe(0);
  });
});
