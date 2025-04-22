JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('donwer_text');
    let pollingInterval = null;

    console.log("script for input text is ready!!!!");
    
    const jsonKey = JFCustomWidget.getWidgetSettings("key").Key;

    function pollData() {
        console.log("Poll data with the key name: ", jsonKey);
        console.log("Data in textfield: ", textField.value);
        console.log("Data from another field: ", JFCustomWidget.getFormFieldValue("input_9"));
        console.log("Data from another field...: ", JFCustomWidget.getFormFieldValue("submission-dropdown"));

        if (textField.value && JFCustomWidgetUtils.isJsonString(textField.value)) {
            const value = JSON.parse(textField.value);
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



JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('donwer_text');
    let pollingInterval = null;

    JFCustomWidget.getWidgetSettings(function(settings) {
        const jsonKey = JFCustomWidget.getWidgetSettings("key").Key;
        const sourceFieldId = settings.sourceFieldId || 'submission-dropdown';
        const outputFieldId = settings.outputFieldId || 'input_9';

        console.log("Poll data with the key name: ", jsonKey);
        console.log("Data in textfield: ", textField.value);

        function processJsonData(jsonData) {
            if (jsonData && JFCustomWidgetUtils.isJsonString(jsonData)) {
                try {
                    const parsedData = JSON.parse(jsonData);
                    const value = parsedData[jsonKey] || '';
                    textField.value = value;
                    JFCustomWidget.sendData({ field: outputFieldId, value });
                } catch (error) {
                    textField.value = '';
                    JFCustomWidget.sendData({ field: outputFieldId, value: '' });
                }
            } else {
                textField.value = '';
                JFCustomWidget.sendData({ field: outputFieldId, value: '' });
            }
        }

        JFCustomWidget.subscribe("widgetpopulate", function(data) {
            if (data && data.value) processJsonData(data.value);
        });

        function pollSourceField() {
            JFCustomWidget.getFormFieldValue(sourceFieldId, function(jsonData) {
                console.log("JSON Data below...");
                console.log("Data here: ", jsonData);
                if (jsonData) {
                    processJsonData(jsonData);
                } else {
                    JFCustomWidget.getFrameData(function(frameData) {
                        processJsonData(frameData[sourceFieldId]);
                    });
                }
            });
        }

        pollSourceField();
        pollingInterval = setInterval(pollSourceField, 500);
        setTimeout(() => {
            if (pollingInterval) clearInterval(pollingInterval);
        }, 30000);
    });
});