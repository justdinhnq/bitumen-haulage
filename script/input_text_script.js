JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('json-value');
    const jsonFieldId = 'submission-dropdown'; // Field ID with JSON from first widget
    const outputFieldId = 'input_4'; // Field ID to send extracted value
    let pollingInterval = null;

    console.log("script for input text is ready!!!!");

    // Get JSON key from General tab
    JFCustomWidget.getWidgetSettings(function(settings) {
        const jsonKey = settings.jsonKey || 'test1'; // Default to 'test1' if not set
        console.log("JSON Key from settings:", jsonKey);

        // Poll for JSON data from input_6
        function pollJsonData() {
            JFCustomWidget.getFormFieldValue(jsonFieldId, function(jsonData) {
                console.log("Received JSON data:", jsonData);

                if (jsonData && JFCustomWidgetUtils.isJsonString(jsonData)) {
                    try {
                        const parsedData = JSON.parse(jsonData);
                        const value = parsedData[jsonKey] || '';
                        console.log("Extracted value for", jsonKey, ":", value);

                        // Update text field
                        textField.value = value;

                        // Send value to form field
                        JFCustomWidget.sendData({
                            field: outputFieldId,
                            value: value
                        });
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        textField.value = '';
                        JFCustomWidget.sendData({
                            field: outputFieldId,
                            value: ''
                        });
                    }
                } else {
                    // Clear text field and output if no JSON
                    textField.value = '';
                    JFCustomWidget.sendData({
                        field: outputFieldId,
                        value: ''
                    });
                }
            });
        }

        // Start polling every 500ms
        pollJsonData();
        pollingInterval = setInterval(pollJsonData, 500);

        // Stop polling after 30 seconds to prevent infinite loops
        setTimeout(() => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                console.log("Stopped polling for JSON data");
            }
        }, 30000);
    });
});