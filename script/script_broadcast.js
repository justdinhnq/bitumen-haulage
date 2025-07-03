// send message to the channel
function handleSelection() {
    senderName = JFCustomWidget.getWidgetSetting("senderName");
    let sender = 'talk_channel_'+senderName

    console.log("[Sender]Sender name: ", senderName)
    const channel = new BroadcastChannel(sender);
    
    const selectElement = document.getElementById('submission-dropdown');
    const value = selectElement.value; // Get the selected value
    const key = selectElement.options[selectElement.selectedIndex].text; // Get the selected option's text

    channel.postMessage(value); 
    console.log('Message sent:', value);
}