// Jotform Widget Framework communication
window.addEventListener("message", function (event) {
  if (event.data.type === "setCustomFieldValue") {
    const emailList = document.getElementById("emailList");
    const options = emailList.getElementsByClassName("email-option");
    for (let option of options) {
      if (option.dataset.email === event.data.value) {
        option.classList.add("selected");
        document.getElementById("emailSearch").value = event.data.value;
      } else {
        option.classList.remove("selected");
      }
    }
  }
});

// Initialize widget
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("charInput");
  const searchButton = document.getElementById("searchButton");
  //   const emailSearch = document.getElementById("emailSearch");
  const emailList = document.getElementById("emailList");
  const errorDiv = document.getElementById("error");
  const loadingDiv = document.getElementById("loading");
  let emails = [];

  // Enable/disable search button based on input length
  input.addEventListener("input", function () {
    const value = input.value.trim();
    searchButton.disabled = value.length <= 3;
    errorDiv.style.display = "none";
    loadingDiv.style.display = "none";
    // emailSearch.disabled = true;
    // emailSearch.value = "";
    // emailList.innerHTML = "";
    // emailList.style.display = "none";
    // emails = [];
  });

  // Handle search button click
  searchButton.addEventListener("click", function () {
    const value = input.value.trim().toUpperCase();
    if (value.length > 3) {
      fetchEmails(value);
    }
  });

  // Handle email selection
  emailList.addEventListener("click", function (e) {
    if (e.target.classList.contains("email-option")) {
      const selectedEmail = e.target.dataset.email;
      //   emailSearch.value = selectedEmail;
      const options = emailList.getElementsByClassName("email-option");
      for (let option of options) {
        option.classList.remove("selected");
      }
      e.target.classList.add("selected");
      parent.postMessage(
        {
          type: "setCustomFieldValue",
          value: selectedEmail,
        },
        "*"
      );
    }
  });

  // Filter emails based on search input
  //   emailSearch.addEventListener("input", function () {
  //     const filter = emailSearch.value.toLowerCase();
  //     const options = emailList.getElementsByClassName("email-option");
  //     for (let option of options) {
  //       const email = option.dataset.email.toLowerCase();
  //       option.style.display = email.includes(filter) ? "" : "none";
  //     }
  //     emailList.style.display = emails.length > 0 ? "block" : "none";
  //   });

  // Function to fetch emails from Azure Logic Apps
  function fetchEmails(chars) {
    loadingDiv.style.display = "block";
    // emailSearch.disabled = true;
    // emailSearch.value = "";
    // emails = [];

    const endpoint =
      "https://prod-11.australiasoutheast.logic.azure.com:443/workflows/eacee289c4be4a2bb25017c648038abf/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=za94ZC2QrQmONvsO7dsLbw_WSkzbE7qVirC51g6OTIY";

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ characters: chars }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }
        return response.json();
      })
      .then((data) => {
        loadingDiv.style.display = "none";
        if (Array.isArray(data) && data.length > 0) {
          emails = data.filter((item) => item.Mail).map((item) => item.Mail);
          console.log("Fetched emails:", emails);
          if (emails.length > 0) {
            updateEmailList(emails);
            // emailSearch.disabled = false;
          } else {
            errorDiv.textContent = "No valid emails found";
            errorDiv.style.display = "block";
          }
        } else {
          errorDiv.textContent = "No emails found";
          errorDiv.style.display = "block";
        }
      })
      .catch((error) => {
        loadingDiv.style.display = "none";
        errorDiv.textContent = "Error fetching emails";
        errorDiv.style.display = "block";
        console.error("Fetch error:", error);
      });
  }
});

// Update the content of the dropdown list with id 'emailList'
function updateEmailList(emails) {
  const emailList = document.getElementById("emailList");
  // emailList.innerHTML = ""; // Clear previous options

  emails.forEach((email) => {
    const option = document.createElement("option");
    option.value = email;
    option.textContent = email;
    emailList.appendChild(option);
  });

  emailList.style.display = emails.length > 0 ? "block" : "none";
}
