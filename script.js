document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '38253712fa8d8d79431cd7ec2ca697ee';
    const formId = '250956600933055';
    const dropdown = document.getElementById('submission-dropdown');
    const nameField = document.getElementById('name-field');
    let submissionsData = [];

    // Fetch submissions from JotForm API
    fetch(`https://downer.jotform.com/API/form/${formId}/submissions?apiKey=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        submissionsData = data.submissions;

        console.log('submissionsData:', submissionsData);
        
        // Populate dropdown with submission IDs
        submissionsData.forEach(submission => {
            const option = document.createElement('option');
            option.value = submission.id;
            option.text = `Submission ${submission.id}`;
            dropdown.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching submissions:', error);
        dropdown.innerHTML = '<option value="">Error loading submissions</option>';
    });

    // Handle dropdown selection
    dropdown.addEventListener('change', function() {
        const selectedId = this.value;
        if (selectedId) {
            const selectedSubmission = submissionsData.find(sub => sub.id === selectedId);
            if (selectedSubmission && selectedSubmission.data.name) {
                nameField.value = selectedSubmission.data.name.value;
            } else {
                nameField.value = 'No name found';
            }
        } else {
            nameField.value = '';
        }
    });
});