const POWER_AUTOMATE_URL =
  "https://prod-14.australiasoutheast.logic.azure.com:443/workflows/95ae937e45fc428ebc665758f7cdd45e/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ozvB4cLU1-l2H3o85H7v8nBe1Bm4ZYk4VckfU-6E-xo";

const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .split(".")[0]
  .replace(/(\d{2})(\d{2})(\d{2})$/, "_$1_$2_$3");

let formId = "";

// Initialize the widget
window.JFCustomWidget.subscribe("ready", function (data) {
  console.log("Start to fetch a list of contracts.");
  site_address = JFCustomWidget.getWidgetSetting("site_address");
  conditional_column = JFCustomWidget.getWidgetSetting("conditional_column");
  conditional_value = JFCustomWidget.getWidgetSetting("conditional_value");

  column_to_show = JFCustomWidget.getWidgetSetting("column_to_show");
  column_to_value = JFCustomWidget.getWidgetSetting("column_to_value");

  table = JFCustomWidget.getWidgetSetting("table");

  const dropdown = document.getElementById("lookup_list");

  // Fetch contract names from Power Automate
  fetch(POWER_AUTOMATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
        site_addr: site_address,
        conditional_col: conditional_column,
        conditional_val: conditional_value,
        col_to_show: column_to_show,
        col_to_value: column_to_value,
        table_name: table
    }), 
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.project; // Use project code as the value
        option.textContent = item.contract; // Display contract name
        dropdown.appendChild(option);
      });

      const numberOfOptions = dropdown.options.length;
      console.log("Number of options: ", numberOfOptions);
    })
    .catch((err) => {
      console.error("Error fetching:", error);
    });
});

// Subscribe to form submit event
window.JFCustomWidget.subscribe("submit", function () {
  const selectElement = document.getElementById("lookup_list");
  const value = selectElement.value;

  window.JFCustomWidget.sendData({ value: value });
});

// send message to the channel
function handleSelection() {
  senderName = JFCustomWidget.getWidgetSetting("senderName");
  let sender = "talk_channel_" + senderName;

  console.log("[Sender]Sender name: ", senderName);
  const channel = new BroadcastChannel(sender);

  const selectElement = document.getElementById("lookup_list");
  const value = selectElement.value; // Get the selected value
  const key = selectElement.options[selectElement.selectedIndex].text; // Get the selected option's text

  channel.postMessage(value);
  console.log("Message sent:", value);
}
