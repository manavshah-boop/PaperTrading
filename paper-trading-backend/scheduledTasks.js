const cron = require('node-cron');
const axios = require('axios');

const performLogin = async () => {
  try {
    const username = "random test test";
    const password = "random test test";
    const response = await fetch("https://papertrading-l028.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
  } catch (error) {
    console.error("Register Error:", error);
  }
};

// Schedule the login function to run every 3 minutes
cron.schedule('*/3 * * * *', async () => {
  try {
    console.log('Performing login...');
    await performLogin();
    console.log('Login task completed.');
  } catch (error) {
    console.error('Error in login task:', error.message);
  }
  
});

module.exports = cron;
