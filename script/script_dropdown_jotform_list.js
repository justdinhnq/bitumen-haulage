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
        try {
            const response = await fetch(
                `https://downer.jotform.com/API/form/${formId}/submissions?apiKey=${apiKey}`
            );
            console.log('response: ', response);
            const data = await response.json();
            
            submissionsData = data.content || [];

            console.log('Start here.');
            // Populate dropdown
            dropdown.innerHTML = '<option value="">Select Training Session</option>';
            submissionsData.forEach(submission => {
                console.log('data of each submission: ', submission.answers)

                const textOpt = Object.values(submission.answers).find(
                    answer => answer.name === 'training16'
                );
                
                const end = Object.values(submission.answers).find(
                    answer => answer.name === 'endDatetime'
                );
                const endDateTime = end.prettyFormat;
                console.log('End date string: ', endDateTime);

                // Split the date and time parts
                const [datePart, timePart, meridian] = endDateTime.split(/[\s:]+/); // ['17/11/1983', '12', '20', 'PM']
                const [day, month, year] = datePart.split('/').map(Number);
                let hour = Number(timePart);
                const minute = Number(endDateTime.split(/[\s:]+/)[2]);

                // Convert hour to 24-hour format
                if (meridian === 'PM' && hour !== 12) hour += 12;
                if (meridian === 'AM' && hour === 12) hour = 0;

                // Construct the Date object
                const endDate = new Date(year, month - 1, day, hour, minute);
                console.log('End date: ', endDate);
                console.log('textVal.answer: ', textVal.answer);


                const oneWeekInMs = 1 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
                const now = new Date();
                const gapTime = endDate - now;
                if (gapTime > oneWeekInMs) {
                    const option = document.createElement('option');
                    option.value = textOpt.answer;
                    console.log('Option value: ', option.value);
                    option.text = `${textOpt.answer}`;
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
            value: selectedId,
        });
    });

    // Initial fetch
    fetchSubmissions();
});