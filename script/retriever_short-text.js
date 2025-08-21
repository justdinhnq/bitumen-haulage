// Initialize the widget
window.JFCustomWidget.subscribe("ready", function (data) {
  senderName = JFCustomWidget.getWidgetSetting("senderName");
  let sender = "talk_channel_" + senderName;

  console.log("[Retriever]Sender name: ", senderName);
  const channel = new BroadcastChannel(sender);

  channel.onmessage = function (event) {
    const message = event.data;
    document.getElementById("valueField").value = message;
    console.log("Message received:", message);
  };
});

// Subscribe to form submit event
window.JFCustomWidget.subscribe("submit", function () {
  const widgetContent = document.getElementById("valueField").value;
  console.log("Submitting value:", widgetContent);

  window.JFCustomWidget.sendSubmit({
    valid: true,
    value: widgetContent,
  });
});
