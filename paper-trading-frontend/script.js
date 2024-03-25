document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    login(username, password);
  });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    const investment = document.getElementById("investment").value;
    register(username, password, investment);
  });

  async function login(username, password) {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Successful login, save token to localStorage or session storage
        localStorage.setItem("token", data.token);
        // Redirect to portfolio page or any other page
        window.location.href = "./portfolio.html";
      } else {
        alert(data.message || "Failed to login");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to login");
    }
  }

  async function register(username, password, investment) {
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, investment }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || "User registered successfully");
        login(username, password);
        document.getElementById("registerUsername").value = "";
        document.getElementById("registerPassword").value = "";
        document.getElementById("investment").value = "";
      } else {
        alert(data.error || "Failed to register");
      }
    } catch (error) {
      console.error("Register Error:", error);
      alert("Failed to register");
    }
  }
});
