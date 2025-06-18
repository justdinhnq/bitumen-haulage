let apiKey = '';
let formId = '';
let label = '';

// Main widget logic
JFCustomWidget.subscribe("ready", function() {
    formId = JFCustomWidget.getWidgetSetting("formId");
    apiKey = JFCustomWidget.getWidgetSetting("apiKey")
    label = JFCustomWidget.getWidgetSetting("submissionLabel")

    const dropdown = document.getElementById('submission-dropdown');
    let submissionsData = [];

    // Fetch submissions
    const fetchSubmissions = async () => {
        console.log('start fetching submissions');
        try {
            const response = await fetch(
                `https://api.jotform.com/form/${formId}/submissions?apiKey=${apiKey}`
            );
            console.log('response: ', response);
            const data = await response.json();
            
            submissionsData = data.content || [];

            // Populate dropdown
            dropdown.innerHTML = '<option value="">Select Training Session</option>';
            submissionsData.forEach(submission => {
                console.log('data: ', submission.answers)

                const now = new Date();
                const endDate = Object.values(submission.answers).find(
                    answer => answer.name === 'endDatetime'
                );
                const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

                if (endDate - now > oneWeekInMs) {
                    const option = document.createElement('option');
                    option.value = submission.id;
                    option.text = `${submission.training}`;
                    dropdown.appendChild(option);
                }
            });

            document.getElementById('submission-label').innerText = label;
        } catch (error) {
            console.error('Error fetching submissions:', error);
            dropdown.innerHTML = '<option value="">Error loading submissions</option>';
        }
    };

    // Send data to Jotform when submitted
    JFCustomWidget.subscribe("submit", function() {
        const selectedId = dropdown.value;

        JFCustomWidget.sendSubmit({
            valid: true,
            value: selectedId
        });
    });

    // Initial fetch
    fetchSubmissions();
});