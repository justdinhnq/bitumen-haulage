let apiKey = '';
let submissionID_A = '';
let label = '';

// Main widget logic
JFCustomWidget.subscribe("ready", function() {
    submissionID_A = document.getElementById("submission-textfield").value;

    apiKey = JFCustomWidget.getWidgetSetting("apiKey")
    // label = JFCustomWidget.getWidgetSetting("submissionLabel")
    
    column4Show = JFCustomWidget.getWidgetSetting("column4Show")
    column4Value = JFCustomWidget.getWidgetSetting("column4Value")

    let submissionsData = [];

    // Fetch submissions
    const fetchSubmissions = async () => {
        try {
            const response = await fetch(
                `https://downer.jotform.com/API/submission/${submissionID_A}?apiKey=${apiKey}`
            );
            const data = await response.json();
            
            submissionsData = data.content || [];
            console.log('submissionsData: ', submissionsData);

            // Populate dropdown
            /* const options = []
            submissionsData.forEach(submission => {
                const val1 = Object.values(submission.answers).find(
                    answer => answer.name === column4Show
                );

                const val2 = Object.values(submission.answers).find(
                    answer => answer.name === column4Value
                );
                
                // Only add if both values exist
                if (val1 && val2) {
                    options.push([val1.answer, val2.answer]);
                }
            });
            console.log('options: ', options)
            handleSelection(options); */
            
            handleSelection(submissionsData);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            dropdown.innerHTML = '<option value="">Error loading submissions</option>';
        }
    };

    // Send data to Jotform when submitted
   /*  JFCustomWidget.subscribe("submit", function() {
        const selectedId = dropdown.value;
        JFCustomWidget.sendSubmit({
            valid: true,
            value: selectedId,
        });
    }); */

    // Listen for changes in the textfield and run fetchSubmissions when it has a value
    const textfield = document.getElementById("submission-textfield");
    textfield.addEventListener("input", function() {
        if (textfield.value && textfield.value.trim() !== "") {
            fetchSubmissions();
        }
    });
});

// send message to the channel
function handleSelection(data) {
  for (const element of data) {
    console.log('Selected user details:', element);
    for (const key in element) {
      let sender = 'talk_channel_'+key
  
      console.log("[Sender]Sender name: ", sender)
      const channel = new BroadcastChannel(sender);
      
      const value = element[key]; // Get the selected value
  
      channel.postMessage(value); 
      console.log('Message sent:', value);
    }
    
  }
}