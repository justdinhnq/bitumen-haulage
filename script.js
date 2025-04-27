JFCustomWidget.subscribe("ready", function() {
    // downer.jotform.com/API
    const apiKey = '38253712fa8d8d79431cd7ec2ca697ee'; 
    const formId = '250777678878079';

    const dropdown = document.getElementById('submission-dropdown');
    const fields = {
        'driver-name': { type: 'text', name: 'driverName' },
        'driver-signature': { type: 'image', name: 'driverSignature' },
        'loading-point': { type: 'text', name: 'loadingPoint' },
        'customer-name': { type: 'text', name: 'customerName' },
        'requested-time': { type: 'text', name: 'requestedTime' },
        'downer-po': { type: 'text', name: 'downerPurchaseOrder' },
        'product': { type: 'text', name: 'product' },
        'loading-time-in': { type: 'text', name: 'loadingTimeIn' },
        'loading-time-out': { type: 'text', name: 'loadingTimeOut' },
        'bitumen-tanker-number': { type: 'text', name: 'bitumenTankerNumber' },
        'company-name': { type: 'text', name: 'companyName' },
        'refinery-name': { type: 'text', name: 'refineryName' },
        'batch-number': { type: 'text', name: 'batchNumber' },
        'load-temperature': { type: 'image', name: 'loadTemperature' },
        'tank-temperature': { type: 'image', name: 'tankTemperature' },
        'gross-weight': { type: 'image', name: 'grossWeight' },
        'tare-weight': { type: 'image', name: 'tareWeight' },
        'net-weight': { type: 'image', name: 'netWeight' }
    };
    let submissionsData = [];

    console.log('subscribing');

    // Fetch submissions
    const fetchSubmissions = async () => {
        console.log('start fetching submissions');
        try {
            const response = await fetch(
                `https://downer.jotform.com/API/form/${formId}/submissions?apiKey=${apiKey}`
            );
            console.log('response: ', response);
            const data = await response.json();
            
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
            console.log('selectedSubmission.answers: ', selectedSubmission.answers);
            if (selectedSubmission && selectedSubmission.answers) {
                // Update all fields
                Object.keys(fields).forEach(fieldId => {
                    const field = fields[fieldId];
                    const element = document.getElementById(fieldId);
                    const answer = Object.values(selectedSubmission.answers).find(
                        ans => ans.name === field.name
                    );
                    if (field.type === 'text') {
                        console.log('fieldId: ', fieldId, '; answer: ', answer);
                        if (fieldId === 'driver-name' && answer && answer.answer && typeof answer.answer === 'object') {
                            // Handle Full Name object
                            const { first = '', last = '' } = answer.answer;
                            element.value = `${first} ${last}`.trim() || `No ${field.name} found`;
                        } else if (fieldId === 'loading-point' && answer && answer.answer) {
                            // Extract lat/lng from Google Maps URL
                            const url = answer.answer;
                            const match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                            if (match) {
                                const lat = match[1];
                                const lng = match[2];
                                element.value = 'Loading...';
                                // Fetch address using Google Maps Geocoding API
                                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyDNiOkBAfWzzI5cWSTU7rXLYANzMvLCOKk`)
                                    .then(response => response.json())
                                    .then(data => {
                                        element.value = data.results[0]?.formatted_address || `No ${field.name} found`;
                                    })
                                    .catch(() => {
                                        element.value = `No ${field.name} found`;
                                    });
                            } else {
                                element.value = `No ${field.name} found`;
                            }
                        } else if (fieldId === 'requested-time' && answer && answer.answer && typeof answer.answer === 'object') {
                            // Handle datetime object
                            const { day = '', month = '', year = '' } = answer.answer;
                            element.value = `${day}-${month}-${year}`.trim() || `No ${field.name} found`;
                        } else {
                            // Handle other text fields
                            element.value = answer && answer.answer ? answer.answer : `No ${field.name} found`;
                        }
                    } else if (field.type === 'image') {
                        // Handle image fields, including arrays from file uploads
                        const imageUrl = answer && answer.answer 
                            ? (Array.isArray(answer.answer) ? answer.answer[0] : answer.answer)
                            : '';
                        element.src = imageUrl;
                        element.alt = imageUrl ? field.name : `No ${field.name} found`;
                    }
                });
            } else {
                // Reset all fields if no submission data
                Object.keys(fields).forEach(fieldId => {
                    const field = fields[fieldId];
                    const element = document.getElementById(fieldId);
                    if (field.type === 'text') {
                        element.value = `No ${field.name} found`;
                    } else if (field.type === 'image') {
                        element.src = '';
                        element.alt = `No ${field.name} found`;
                    }
                });
            }
        } else {
            // Clear all fields
            Object.keys(fields).forEach(fieldId => {
                const field = fields[fieldId];
                const element = document.getElementById(fieldId);
                if (field.type === 'text') {
                    element.value = '';
                } else if (field.type === 'image') {
                    element.src = '';
                    element.alt = field.name;
                }
            });
        }
    });

    // Send data to Jotform when submitted
    JFCustomWidget.subscribe("submit", function() {
        const selectedId = dropdown.value;
        const values = [selectedId];
        Object.keys(fields).forEach(fieldId => {
            const field = fields[fieldId];
            const element = document.getElementById(fieldId);
            values.push(field.type === 'text' ? element.value : element.src);
        });
        console.log('Sending values:', values);
        JFCustomWidget.sendSubmit({
            valid: true,
            value: values
        });
    });

    // Initial fetch
    fetchSubmissions();
});