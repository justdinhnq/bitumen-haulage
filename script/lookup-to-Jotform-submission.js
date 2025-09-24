JFCustomWidget.subscribe("ready", function() {
    apiKey = JFCustomWidget.getWidgetSetting("apiKey")

    // Fetch submissions
    const fetchSubmissions = async () => {
        try {
            submissionID_A = document.getElementById("submission-textfield").value;

            const url = `https://downer.jotform.com/API/submission/${submissionID_A}?apiKey=${apiKey}`;
            console.log('Fetch URL: ', url);
            const response = await fetch(
                url
            );
            const data = await response.json();
            
            console.log('submission info: ', data.content.answers);
            
            handleSelection(data.content.answers);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            dropdown.innerHTML = '<option value="">Error loading submissions</option>';
        }
    };
    
    // Listen for changes in the textfield and run fetchSubmissions when it has a value
    const textfield = document.getElementById("submission-textfield");
    textfield.addEventListener("input", function() {
        if (textfield.value && textfield.value.trim() !== "") {
            fetchSubmissions();
        }
    });
});

// send message to the channel
function handleSelection(input) {
  for (const element of input) {
    console.log('Selected user details:', element);
    for (const field in element) {
        let key = field.name;
        let sender = 'talk_channel_'+key
  
        console.log("[Sender]Sender name: ", sender)
        const channel = new BroadcastChannel(sender);
        
        const value = field.answer !== undefined ? field.answer : '';
    
        channel.postMessage(value); 
        console.log('Message sent:', value);
    }
    
  }
}