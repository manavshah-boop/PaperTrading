const baseURL = "https://papertrading-l028.onrender.com";
const displayPortfolio = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseURL}/portfolio`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const portfolioList = document.getElementById("portfolio-list");
    portfolioList.innerHTML = "";

    if (response.data.length === 0) {
      portfolioList.innerHTML = "<p>No cryptocurrencies in portfolio.</p>";
    } else {
      const portfolioItems = response.data.map((item, index) => {
        return `<div class="portfolio-item" onclick="toggleDetails(${index})">
        <p><strong>Symbol:</strong> ${item.symbol}</p>
        <div class="portfolio-details" id="portfolio-details-${index}">
          <p><strong>Quantity:</strong> ${item.quantity}</p>
          <p><strong>Average Price:</strong> $${item.average_price.toFixed(2)}</p>
          <p><strong>Total Value:</strong> $${(item.quantity * item.average_price).toFixed(2)}</p>
        </div>
      </div>`;
      });
      portfolioList.innerHTML = portfolioItems.join("");
    }
  } catch (error) {
    console.error("Error fetching portfolio:", error.message);
  }
};

const displayBuyingPower = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseURL}/buying_power`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const buyingPowerElement = document.getElementById("buying-power");
    buyingPowerElement.innerHTML = "";
    if (response.data.buyingPower !== undefined) {
      buyingPowerElement.innerHTML = `<p><strong>Buying Power:</strong> $${response.data.buyingPower.toFixed(2)}</p>`;
    } else {
      buyingPowerElement.innerHTML = "<p>Unable to fetch buying power.</p>";
    }
  } catch (error) {
    console.error("Error fetching buying power:", error.message);
  }
};


const fetchSymbols = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${baseURL}/symbols`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const allSymbols = response.data.allSymbols.sort();
    const allSymbolsNames = response.data.allSymbolsNames.sort();

    var symbolList = document.getElementById("symbol-list");
    var i = 0;
    for (let i = 0; i < allSymbols.length; i++) {
      const option = document.createElement("option");
      option.value = allSymbols[i];
      option.text = allSymbolsNames[i];
      symbolList.appendChild(option);
    }
    const ssymbol = document.getElementById("s-symbol");
    const bsymbol = document.getElementById("b-symbol");
    // Event listener for input changes
    ssymbol.addEventListener("input", function () {
      const inputValue = ssymbol.value.toLowerCase();

      const filteredSymbols = allSymbols.filter((data) =>
        data.toLowerCase().startsWith(inputValue)
      );

      const filteredSymbolsNames = allSymbolsNames.filter((data) =>
        data.toLowerCase().startsWith(inputValue)
      );


      // Clear existing options
      symbolList.innerHTML = "";

      // Add filtered symbols to the datalist
      for (i = 0; i < filteredSymbols.length; i++) {
        const option = document.createElement("option");
        option.value = filteredSymbols[i];
        option.text = filteredSymbolsNames[i];
        symbolList.appendChild(option);
      }
    });
    bsymbol.addEventListener("input", function () {
      const inputValue = bsymbol.value.toLowerCase();

      const filteredSymbols = allSymbols.filter((data) =>
        data.toLowerCase().startsWith(inputValue)
      );

      const filteredSymbolsNames = allSymbolsNames.filter((data) =>
        data.toLowerCase().startsWith(inputValue)
      );


      // Clear existing options
      symbolList.innerHTML = "";

      // Add filtered symbols to the datalist
      for (i = 0; i < filteredSymbols.length; i++) {
        const option = document.createElement("option");
        option.value = filteredSymbols[i];
        option.text = filteredSymbolsNames[i];
        symbolList.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error fetching cryptocurrency symbols: ", error.message);
  }
}



const buyForm = document.getElementById("buy-form");
buyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const symbol = document.getElementById("b-symbol").value;
  const quantity = parseFloat(document.getElementById("b-quantity").value);
  // Reset input values
  document.getElementById("b-quantity").value = "";
  document.getElementById("b-symbol").value = "";
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${baseURL}/buy`,
      { symbol, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    displayPortfolio();
    displayBuyingPower();
  } catch (error) {
    console.error("Error buying cryptocurrency:", error.message);
    alert("Failed to buy cryptocurrency. You either don't have enough buying power or the cryptocurrency symbol is invalid.");
  }
});

const sellForm = document.getElementById("sell-form");
sellForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const symbol = document.getElementById("s-symbol").value;
  const quantityInput = document.getElementById("s-quantity");
  const quantity = parseFloat(quantityInput.value);
  
  // Reset input values
  document.getElementById("s-quantity").value = "";
  document.getElementById("s-symbol").value = "";

  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${baseURL}/sell`,
      { symbol, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    displayPortfolio();
    displayBuyingPower();
  } catch (error) {
    console.error("Error selling cryptocurrency:", error.message);
  }
});

function toggleDetails(index) {
  const details = document.getElementById(`portfolio-details-${index}`);
  if (details.style.display === "block") {
    details.style.display = "none";
  } else {
    details.style.display = "block";
  }
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./index.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (token) {
    displayPortfolio();
    displayBuyingPower();
    fetchSymbols();
  } else {
    // Redirect to login if not logged in
    window.location.href = "./index.html";
  }
});
