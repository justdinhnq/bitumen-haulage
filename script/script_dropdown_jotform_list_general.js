let apiKey = '';
let formId = '';
let label = '';

// Main widget logic
JFCustomWidget.subscribe("ready", function() {
    formId = JFCustomWidget.getWidgetSetting("id4Form");
    apiKey = JFCustomWidget.getWidgetSetting("apiKey")
    label = JFCustomWidget.getWidgetSetting("label")
    
    column4Show = JFCustomWidget.getWidgetSetting("column4Show")
    column4Value = JFCustomWidget.getWidgetSetting("column4Value")

    const dropdown = document.getElementById('submission-dropdown');
    let submissionsData = [];

    // Fetch submissions
    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `https://downer.jotform.com/API/form/${formId}/submissions?apiKey=${apiKey}`
            );
            const data = await response.json();
            
            submissionsData = data.content || [];
            console.log('https://downer.jotform.com/API/form/',formId,'/submissions?apiKey=',apiKey);
            console.log('submissionsData: ', submissionsData);

            // Populate dropdown
            dropdown.innerHTML = '<option value="">Select Training Session</option>';
            submissionsData.forEach(submission => {
                const status = Object.values(submission.answers).find(
                    answer => answer.name === 'typeA55'
                );

                const textOpt = Object.values(submission.answers).find(
                    answer => answer.name === column4Show
                );

                const textOptValue = Object.values(submission.answers).find(
                    answer => answer.name === column4Value
                );
                
                
                const option = document.createElement('option');
                option.value = textOptValue.answer;
                option.text = textOpt.answer;
                dropdown.appendChild(option);
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
            value: selectedId,
        });
    });

    // Initial fetch
    fetchSubmissions();
});