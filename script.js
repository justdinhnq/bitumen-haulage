window.jotformCustomWidgetInitialized(function (data) {
    console.log("Widget initialized:", data);
});

function calculateCost() {
    const distance = parseFloat(document.getElementById("distance").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const ratePerKmPerTon = 2.5; // Example rate: $2.5 per km per ton
    const cost = distance * weight * ratePerKmPerTon;

    if (isNaN(cost)) {
        document.getElementById("result").innerText = "Please enter valid numbers.";
        return;
    }

    document.getElementById("result").innerText = `Cost: $${cost.toFixed(2)}`;

    // Send result to JotForm
    window.jotformCustomWidget.sendData({
        value: cost.toFixed(2),
        valid: true
    });
}