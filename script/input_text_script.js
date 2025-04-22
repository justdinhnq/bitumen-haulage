JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('donwer_text');

    // Get JSON key from General tab
    JFCustomWidget.getWidgetSettings(function(settings) {
        const jsonKey = settings.key; // Default to 'test1' if not set
        console.log("JSON Key from settings:", jsonKey);

        // Subscribe to form data changes
        JFCustomWidget.subscribe("formData", function() {
            const jsonData = textField
            console.log("Received JSON data:", jsonData);

            if (jsonData) {
                try {
                    // Parse JSON
                    const parsedData = JSON.parse(jsonData);
                    const value = parsedData[jsonKey] || '';
                    console.log("Extracted value for", jsonKey, ":", value);

                    // Display value in text field
                    textField.value = value;

                    // Send value to form field
                    JFCustomWidget.sendData({
                        value: value
                    });
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                    textField.value = '';
                    JFCustomWidget.sendData({
                        value: ''
                    });
                }
            } else {
                // Clear text field and output if no JSON
                textField.value = '';
                JFCustomWidget.sendData({
                    value: ''
                });
            }
        });
    });
});