apiKey = '38253712fa8d8d79431cd7ec2ca697ee';//JFCustomWidget.getWidgetSetting("apiKey")
// label = JFCustomWidget.getWidgetSetting("submissionLabel")

// Fetch submissions
const fetchSubmissions = async () => {
    try {
        submissionID_A = '6291102641966994926'; //document.getElementById("submission-textfield").value;

        const url = `https://downer.jotform.com/API/submission/${submissionID_A}?apiKey=${apiKey}`;
        console.log('Fetch URL: ', url);
        const response = await fetch(
            url
        );
        const data = await response.json();
        
        console.log('submission info: ', data.content);
        
        handleSelection(data.content);
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