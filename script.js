// Load Jotform widget SDK
document.addEventListener('DOMContentLoaded', function() {
    // If running outside Jotform widget context, include the SDK
    if (typeof JFCustomWidget === 'undefined') {
        const script = document.createElement('script');
        script.src = '//js.jotform.com/JotFormCustomWidget.min.js';
        document.head.appendChild(script);
    }
});

// Main widget logic
JFCustomWidget.subscribe("ready", function() {
    const apiKey = '38253712fa8d8d79431cd7ec2ca697ee'; // Hardcoded as per your original
    const formId = '250956600933055'; // Hardcoded as per your original
    const dropdown = document.getElementById('submission-dropdown');
    const nameField = document.getElementById('name-field');
    let submissionsData = [];

    // Fetch submissions
    // https://downer.jotform.com/API/form/250956600933055/submissions?apiKey=38253712fa8d8d79431cd7ec2ca697ee
    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `https://downer.jotform.com/API/form/${formId}/submissions?apiKey=${apiKey}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': '*/*'
                    }
                }
            );
            const data = await response.json();
            console.log('data:', data);
            submissionsData = data.content || [];

            // Populate dropdown
            dropdown.innerHTML = '<option value="">Select a Submission</option>';
            submissionsData.forEach(submission => {
                const option = document.createElement('option');
                option.value = submission.id;
                option.text = `Submission ${submission.id}`;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching submissions:', error);
            dropdown.innerHTML = '<option value="">Error loading submissions</option>';
        }
    };

    // Handle dropdown change
    dropdown.addEventListener('change', function() {
        const selectedId = this.value;
        if (selectedId) {
            const selectedSubmission = submissionsData.find(sub => sub.id === selectedId);
            if (selectedSubmission && selectedSubmission.answers) {
                // Find the 'name' field in answers
                const nameAnswer = Object.values(selectedSubmission.answers).find(
                    answer => answer.name === 'name'
                );
                nameField.value = nameAnswer && nameAnswer.answer ? nameAnswer.answer : 'No name found';
            } else {
                nameField.value = 'No name found';
            }
        } else {
            nameField.value = '';
        }
    });

    // Send data to Jotform when submitted
    JFCustomWidget.subscribe("submit", function() {
        const selectedId = dropdown.value;
        const nameValue = nameField.value;
        JFCustomWidget.sendSubmit({
            valid: true,
            value: JSON.stringify({ submissionId: selectedId, name: nameValue })
        });
    });

    // Initial fetch
    fetchSubmissions();
});