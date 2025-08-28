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

document.getElementById("emailList").addEventListener("change", function () {
  const confirmButton = document.getElementById("confirmButton");
  if (this.value) {
    confirmButton.style.display = "inline-block"; // show
  } else {
    confirmButton.style.display = "none"; // hide
  }
});

// Initialize widget
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("charInput");
  const searchButton = document.getElementById("searchButton");
  const confirmButton = document.getElementById("confirmButton");
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
  });

  // Handle search button click
  searchButton.addEventListener("click", function () {
    const value = input.value.trim().toUpperCase();
    if (value.length > 3) {
      fetchEmails(value);
    }
  });

  confirmButton.addEventListener("click", function () {
    if (emailList.value) {
      fetchDetails(emailList.value);
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

  // Function to fetch emails from Azure Logic Apps
  function fetchEmails(chars) {
    loadingDiv.style.display = "block";

    const endpoint = "https://prod-59.australiasoutheast.logic.azure.com:443/workflows/f1f88ff29d4e4933a93a14f08f8096ff/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tWIpcOWPaOCuK_cC01cc3g7-IG8BAJWMn3A80lPtyJY";

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        characters: chars,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }
        return response.json();
      })
      .then((data) => {
        loadingDiv.style.display = "none";
        console.log("Fetched data:", data);
        if (Array.isArray(data) && data.length > 0) {
          updateEmailList(data);
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

  // Function to fetch emails from Azure Logic Apps
  function fetchDetails(idValue) {
    const endpoint = "https://prod-61.australiasoutheast.logic.azure.com:443/workflows/b27b1ad245834defbca6480201ad23f1/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2hGwNwwYcfYXLQIYZjWVw7doiUy_iwjD4clSAD_xZjc";

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        EmpID: idValue,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        return response.json();
      })
      .then((data) => {
        loadingDiv.style.display = "none";
        if (Array.isArray(data) && data.length > 0) {
          handleSelection(data);
        }
      })
      .catch((error) => {
        loadingDiv.style.display = "none";
        errorDiv.textContent = "Error fetching user details";
        errorDiv.style.display = "block";
        console.error("Fetch error:", error);
      });
  }

  // Send data to Jotform when submitted
  /* JFCustomWidget.subscribe("submit", function() {
      const selectedId = document.getElementById("emailList").value;
      JFCustomWidget.sendSubmit({
          valid: true,
          value: selectedId,
      });
  }) */;
});

function updateEmailList(data) {
  const emailList = document.getElementById("emailList");
  emailList.innerHTML = ""; // Clear previous options

  emailList.appendChild(new Option("Please Select", ""));

  console.log("Fetched emails:", data);
  data.forEach((element) => {
    console.log("Adding email option:", element);
    const option = document.createElement("option");
    option.value = element.EmpID;
    option.textContent = `${element.Mail}[${element.DisplayName}]`;
    emailList.appendChild(option);
  });

  emailList.style.display = data.length > 0 ? "block" : "none";
}

// send message to the channel
function handleSelection(data) {
  for (const element of data) {
    console.log('Selected user details:', element);
    for (const key in element) {
      let sender = 'talk_channel_'+key
  
      console.log("[Sender]Sender name: ", sender)
      const channel = new BroadcastChannel(sender);
      
      const value = element[key]; // Get the selected value
  
      channel.postMessage(value); 
      console.log('Message sent:', value);
    }
    
  }
}