JFCustomWidget.subscribe("ready", function() {
    const dropdown = document.getElementById('submission-dropdown');

    // Populate dropdown with static options (can be replaced with API fetch)
    const options = [
        { value: "Option1", text: "Option 1" },
        { value: "Option2", text: "Option 2" },
        { value: "Option3", text: "Option 3" }
    ];

    dropdown.innerHTML = '<option value="">Select an Option</option>';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.text = option.text;
        dropdown.appendChild(opt);
    });

    // Handle dropdown change
    dropdown.addEventListener('change', function() {
        const selectedValue = this.value;
        if (selectedValue) {
            console.log('Selected value for the field ID of input_4: ', selectedValue);
            // Send selected value to the Jotform form field
            JFCustomWidget.sendData({
                field: 'input_4',
                value: selectedValue
            });
        } else {
            // Clear the form field if no selection
            JFCustomWidget.sendData({
                value: ''
            });
        }
    });
});