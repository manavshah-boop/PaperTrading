const cron = require('node-cron');
const axios = require('axios');

const performLogin = async () => {
  try {
    const loginData = {
      username: "random test test",
      password: "random test test"
    };

    const response = await axios.post('http://localhost:3000/login', loginData);
    console.log('Login response:', response.data);
  } catch (error) {
    console.error('Error logging in:', error.message);
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
