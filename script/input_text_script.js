JFCustomWidget.subscribe("ready", function() {
    const textField = document.getElementById('donwer_text');
    let pollingInterval = null;

    const jsonKey = JFCustomWidget.getWidgetSettings("key").Key;
    const sourceFieldId = 'submission-dropdown';
    const outputFieldId = 'input_9';

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
        console.log("Data: ", JFCustomWidget.getFieldsValueById('input_4'));
        
        //if (jsonData) {
        //    processJsonData(jsonData);
        //} 
    }

    pollSourceField();
    pollingInterval = setInterval(pollSourceField, 500);
    setTimeout(() => {
        if (pollingInterval) clearInterval(pollingInterval);
    }, 30000);
});