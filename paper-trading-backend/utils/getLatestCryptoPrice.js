/*
 * File: getLatestCryptoPrice.js
 * Description: Utility function to fetch the latest cryptocurrency price from an API.
 * This function uses Axios to make a GET request to the specified API URL with the provided symbol.
 * It returns the latest price in USD or throws an error if the request fails.
 */


const { env } = require("process");
const apiKey = process.env.API_KEY;
const axios = require("axios");

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

module.exports = { getLatestCryptoPrice };