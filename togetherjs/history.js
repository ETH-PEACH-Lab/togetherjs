define([
  "require", "jquery", "util", "session", "peers"
], function (require, $, util, session, peers) {

  function getUserName() {
    return peers.Self && peers.Self.name!=="" ? peers.Self.name :peers.Self.defaultName;
  }

  // Function to send history log messages
  function sendHistoryLog(msg) {
    msg.user = getUserName();
    msg.type = "history-log";
    msg.userColor = peers.Self && peers.Self.color ? peers.Self.color : "#333";
    console.log('Sending history log message:', msg);
    session.send(msg);
    appendHistoryLog(msg);
  }

  function appendHistoryLog(msg) {
    const historyPanel = document.getElementById("togetherjs-history-panel");
    if (historyPanel) {
      const entry = document.createElement("div");
      entry.style.marginBottom = "6px";

      // Format time
      const time = new Date(msg.timestamp).toLocaleTimeString();

      // Create colored username span
      const userSpan = document.createElement("span");
      userSpan.textContent = msg.user;
      userSpan.style.color = msg.userColor || "#333";
      userSpan.style.fontWeight = "bold";

      // Compose entry: [time] action (user)
      entry.appendChild(document.createTextNode(`[${time}] ${msg.action} (`));
      entry.appendChild(userSpan);
      entry.appendChild(document.createTextNode(")"));

      // Insert at top
      historyPanel.insertBefore(entry, historyPanel.firstChild);
    }
  }

  function init() {
    // Track button clicks
    document.body.addEventListener("click", function(e) {
      console.log('Button clicked:', e.target);
      if (e.target.tagName === "BUTTON") {
        sendHistoryLog({
          action: "Button clicked",
          buttonText: e.target.textContent,
          timestamp: Date.now()
        });
      }
    });

    // Track input/textarea typing
    document.body.addEventListener("input", function(e) {
      console.log('Input changed:', e.target);
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        sendHistoryLog({
          action: "Input changed",
          inputName: e.target.name || e.target.id,
          value: e.target.value,
          timestamp: Date.now()
        });
      }
    });

    // Track mouse clicks (optional, for non-button elements)
    document.body.addEventListener("mousedown", function(e) {
      // Example: Only track clicks on divs with a certain class
      if (e.target.classList.contains("trackable")) {
        sendHistoryLog({
          action: "Mouse click",
          element: e.target.tagName,
          timestamp: Date.now()
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  session.hub.on("history-log", function(msg) {
    console.log('Received history log message', msg)
    appendHistoryLog(msg);
  });
});