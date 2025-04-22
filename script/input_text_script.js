JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('donwer_text');
    let pollingInterval = null;

    console.log("script for input text is ready!!!!");
    
    const jsonKey = JFCustomWidget.getWidgetSettings("key");

    function pollData() {
        console.log("Poll data with the key name: ", jsonKey);
        
        if (textField.value && JFCustomWidgetUtils.isJsonString(textField.value)) {
            const value = JSON.parse(jsonData);
            console.log("Extracted value for", jsonKey, ":", value);

            // Update text field
            textField.value = value;

            // Send value to form field
            JFCustomWidget.sendData({
                value: value
            });
        }
    }

    // Start polling every 500ms
    pollData();
    pollingInterval = setInterval(pollData, 500);

    // Stop polling after 30 seconds to prevent infinite loops
    setTimeout(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            console.log("Stopped polling for JSON data");
        }
    }, 30000);
});