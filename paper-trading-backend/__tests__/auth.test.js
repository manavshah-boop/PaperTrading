/*
 * File: __tests__/buy.test.js
 * Description: Regestration and login tests for the paper trading backend.
 * This file tests the functionality of user registration and login routes, including
 * handling of successful registration, duplicate usernames, and login with correct
 * and incorrect credentials.
 * Name: Manav Shah
 * Date: 2025-05-25
*/
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../index");
const db = require("../db");
const User = require("../models/User");

describe("AUTH ROUTES", () => {
  const testUsername = "auth_test_user";
  const testPassword = "testpass123";
  // Ensure the test user does not exist before running tests
  beforeEach(async () => {
    await User.deleteByUsername(testUsername);
  });
  // Clean up after tests
  afterAll(async () => {
    await User.deleteByUsername(testUsername);
    await db.end();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => { // Successful registration
      const res = await request(app).post("/register").send({
        username: testUsername,
        password: testPassword,
        investment: 5000,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User registered successfully");
    });

    it("should reject registration with missing fields", async () => { // Test missing field
      const res = await request(app).post("/register").send({ 
        username: testUsername,
        // password missing
        investment: 5000,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Username, password, and investment are required");
    });

    it("should reject duplicate registration", async () => {
      await request(app).post("/register").send({ // Register the user once
        username: testUsername,
        password: testPassword,
        investment: 5000,
      });

      const res = await request(app).post("/register").send({ // Attempt to register same user again
        username: testUsername,
        password: testPassword,
        investment: 5000,
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe("Username already exists");
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      await request(app).post("/register").send({ // Register the user before testing login
        username: testUsername,
        password: testPassword,
        investment: 5000,
      });
    });

    it("should login successfully with correct credentials", async () => { // Successful login
      const res = await request(app).post("/login").send({
        username: testUsername,
        password: testPassword,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET_KEY);
      expect(decoded).toHaveProperty("userId");
    });

    it("should reject login with wrong password", async () => { // Test wrong password
      const res = await request(app).post("/login").send({
        username: testUsername,
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should reject login with unknown user", async () => { // Test unknown user
      const res = await request(app).post("/login").send({
        username: "some_unknown_user",
        password: "any",
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });
});