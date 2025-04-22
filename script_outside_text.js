JFCustomWidget.subscribe("ready", function() {
    const dropdown = document.getElementById('submission-dropdown');

    // Populate dropdown with static options
    const options = [
        { value: "1", text: "1" },
        { value: "2", text: "2" },
        { value: "3", text: "3" }
    ];

    dropdown.innerHTML = '<option value="">Select a Number</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.text = option.text;
        dropdown.appendChild(opt);
    });

    // Handle dropdown change
    dropdown.addEventListener('change', function() {
        const selectedValue = this.value;
        console.log("Sending value:", selectedValue);

        // Approach 1: Send data as widget output
        JFCustomWidget.sendData({
            field: 'input_9',
            value: 'hello'
        });

        console.log("Sending value 2nd time");

        JFCustomWidget.sendData({
            field: 'input_4',
            value: 'world'
        });

        // Approach 2: Send as widget submission (fallback)
        JFCustomWidget.sendSubmit({
            valid: true,
            value: selectedValue || ''
        });

        // Create JSON object
        const jsonData = {
            test1: "value1",
            test2: "value2",
            test3: "value3"
        };
        const jsonString = JSON.stringify(jsonData);
        console.log("Sending to field:", targetFieldId, "Value:", jsonString);
        JFCustomWidget.sendData({
            field: targetFieldId,
            value: jsonString
        });
    });

    const dropdown02 = document.getElementById('submission-dropdown-02');
    dropdown02.innerHTML = '<option value="">khong co gi</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.text = option.text;
        dropdown02.appendChild(opt);
    });
    dropdown02.addEventListener('change', function() {
        
        JFCustomWidget.sendData({
            field: 'input_9',
            value: 'hello'
        });
    });

});