const POWER_AUTOMATE_URL = 'https://prod-32.australiasoutheast.logic.azure.com:443/workflows/91a909c3d25d40ae915c5d1c999b5386/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=HfFypdeUvtsxJjKaUQrTIp5E6EWTFPg2xD-fqcRzlME';

const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0]
        .replace(/(\d{2})(\d{2})(\d{2})$/, '_$1_$2_$3');

let formId = '';

// Initialize the widget
window.JFCustomWidget.subscribe('ready', function(data) {
    console.log("Start to fetch a list of contracts.")
    country = JFCustomWidget.getWidgetSetting("country"); 
    const dropdown = document.getElementById('contractDropdown');

    // Fetch contract names from Power Automate
    fetch(POWER_AUTOMATE_URL, {
    method: 'POST', // Power Automate uses POST for HTTP request triggers
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({'type':country}) // Empty body for a simple request
    })
    .then(response => response.json())
    .then(data => {
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.project; // Use project code as the value
        option.textContent = item.contract; // Display contract name
        dropdown.appendChild(option);
    });

    const numberOfOptions = dropdown.options.length;
    console.log("Number of options: ", numberOfOptions);
    })
    .catch(err => {
    console.error('Error fetching:', error);
    });

    // Send selected value to Jotform
    dropdown.addEventListener('change', function () {
    //JotForm.setFieldValue('contractDropdown', dropdown.value);
    });
});

// Subscribe to form submit event
window.JFCustomWidget.subscribe("submit", function () {
    const selectElement = document.getElementById('contractDropdown');
    const value = selectElement.value;

    window.JFCustomWidget.sendData({ value: value });
});

// send message to the channel
function handleSelection() {
    senderName = JFCustomWidget.getWidgetSetting("senderName");
    let sender = 'talk_channel_'+senderName

    console.log("[Sender]Sender name: ", senderName)
    const channel = new BroadcastChannel(sender);
    
    const selectElement = document.getElementById('contractDropdown');
    const value = selectElement.value; // Get the selected value
    const key = selectElement.options[selectElement.selectedIndex].text; // Get the selected option's text

    channel.postMessage(value); 
    console.log('Message sent:', value);
}