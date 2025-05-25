/*
 * File: __tests__/buy.test.js
 * Description: Tests for the /buy endpoint in the paper trading backend.
 * This file tests the functionality of buying cryptocurrencies, including
 * handling of authentication, sufficient funds, and successful transactions.
 * Author: Manav Shah
 * Date: 2025-05-25   
*/
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");
const db = require("../db");
 
describe("POST /buy", () => {
    let token;
    
    beforeAll(() => {
        // Generate a test JWT token
        token = jwt.sign({ userId: 13 }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  });

  it("should reject request with no token", async () => { // Test without token
    const res = await request(app).post("/buy").send({
      symbol: "BTC",
      quantity: 1,
    });
    expect(res.statusCode).toBe(401);
  });

  it("should reject with insufficient funds", async () => { // Test with insufficient funds
    const res = await request(app)
      .post("/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ symbol: "BTC", quantity: 100000 }); // large enough to exceed buying power

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Insufficient funds");
  });

  it("should succeed when user has enough funds", async () => { // Test with sufficient funds
    const res = await request(app)
      .post("/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ symbol: "BTC", quantity: 0.01 }); // small enough to fit within buying power

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Cryptocurrency bought successfully");
  });
});

afterAll(async () => {
  await db.end();
});
