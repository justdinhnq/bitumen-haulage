JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('donwer_text');
    let pollingInterval = null;

    const jsonKey = JFCustomWidget.getWidgetSettings("key").Key;
    const sourceFieldId = 'submission-dropdown';
    const outputFieldId = 'input_9';

    console.log("Poll data with the key name: ", jsonKey);
    console.log("getFrameData: ", JFCustomWidget.getFrameData)
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
        //console.log("Data: ", JFCustomWidget.getFieldsValueById('input_4'));
        
        //if (jsonData) {
        //    processJsonData(jsonData);
        //} 
    }

    pollSourceField();
    pollingInterval = setInterval(pollSourceField, 500);
    setTimeout(() => {
        if (pollingInterval) clearInterval(pollingInterval);
    }, 30000);

    /* Widget: Receiver (listens for data) */
    function setupWidgetListener(callback) {
        window.addEventListener('message', (event) => {
        // Verify the origin to ensure security
        if (event.origin !== 'https://red-cliff-07b888c00.6.azurestaticapps.net') {
            console.warn('Unauthorized message origin:', event.origin);
            return;
        }
    
        // Verify the message source
        if (event.data.source === 'jotform-widget') {
            console.log('Data received:', event.data.payload);
            callback(event.data.payload);
        }
        });
    }

    /* Example usage in Receiver Widget */
    document.addEventListener('DOMContentLoaded', () => {
        setupWidgetListener((data) => {
        // Handle received data (e.g., display it in the widget)
        const output = document.querySelector('#output');
        if (output) {
            output.textContent = JSON.stringify(data, null, 2);
        }
        });
    });
});