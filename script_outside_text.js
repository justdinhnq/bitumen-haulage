JFCustomWidget.subscribe("ready", function() {
    const dropdown = document.getElementById('submission-dropdown');
    const targetFieldId = 'input_4'; // Replace with the actual Jotform text field ID (e.g., input_5, q5_textBox)

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
        // Send selected value to the specified form field
        JFCustomWidget.sendData({
            field: targetFieldId,
            value: selectedValue || ''
        });
    });
});