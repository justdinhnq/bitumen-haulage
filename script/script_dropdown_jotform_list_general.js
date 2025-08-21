let apiKey = '';
let id4Form = '';
let label = '';

// Main widget logic
JFCustomWidget.subscribe("ready", function() {
    id4Form = JFCustomWidget.getWidgetSetting("id4Form");
    apiKey = JFCustomWidget.getWidgetSetting("apiKey")
    // label = JFCustomWidget.getWidgetSetting("submissionLabel")
    
    column4Show = JFCustomWidget.getWidgetSetting("column4Show")
    column4Value = JFCustomWidget.getWidgetSetting("column4Value")

    const dropdown = document.getElementById('submission-dropdown');
    let submissionsData = [];

    // Fetch submissions
    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `https://downer.jotform.com/API/form/${id4Form}/submissions?apiKey=${apiKey}&limit=10000`
            );
            const data = await response.json();
            
            submissionsData = data.content || [];
            console.log('https://downer.jotform.com/API/form/',id4Form,'/submissions?apiKey=',apiKey);
            console.log('submissionsData: ', submissionsData);

            // Populate dropdown
            const options = []
            submissionsData.forEach(submission => {
                const textOpt = Object.values(submission.answers).find(
                    answer => answer.name === column4Show
                );

                const textOptValue = Object.values(submission.answers).find(
                    answer => answer.name === column4Value
                );
                
                
                const option = document.createElement('option');
                option.value = textOptValue.answer;
                option.text = textOpt.answer;
                options.push(option);
            });
            console.log('options: ', options)

            // repopulate dropdown
            dropdown.innerHTML = '<option value="">Please Select</option>';
            options.sort((a, b) => a.text.localeCompare(b.text)); // Sort options alphabetically
            options.forEach(option => {
                dropdown.appendChild(option);
            });
            // document.getElementById('submission-label').innerText = label;
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