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
            value: selectedValue || ''
        });

        // Approach 2: Send as widget submission (fallback)
        JFCustomWidget.sendSubmit({
            valid: true,
            value: selectedValue || ''
        });
    });
});