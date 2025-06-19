import { parse } from 'date-fns';

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
                const textVal = Object.values(submission.answers).find(
                    answer => answer.name === 'trainingTitle'
                );

                const now = new Date();
                const end = Object.values(submission.answers).find(
                    answer => answer.name === 'endDatetime'
                );
                const endDateTime = end.prettyFormat;
                console.log('End date string: ', endDateTime);
                //const endDate = new Date(endDateTime);
                const endDate = parse(endDateTime, "dd/MM/yyyy hh:mm a", new Date());
                console.log('End date: ', endDate);
                console.log('textVal.answer: ', textVal.answer);


                const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

                if (endDate - now > oneWeekInMs) {
                    const option = document.createElement('option');
                    option.value = submission.id;// + '-' + textVal.answer;
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
            value: selectedId.split('-')[1],
        });
    });

    // Initial fetch
    fetchSubmissions();
});