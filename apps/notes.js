window.apps = window.apps || {};

window.apps["notes"] = function(container, context) {
  container.innerHTML = "";
  container.className = "app-container";

  const wrapper = document.createElement("div");
  wrapper.className = "app-wrapper";

  const textarea = document.createElement("textarea");
  textarea.className = "app-textarea";
  textarea.placeholder = "Type your notes here...";

  wrapper.appendChild(textarea);

  const buttonBar = document.createElement("div");
  buttonBar.className = "app-button-bar";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className = "app-button";

  buttonBar.appendChild(saveBtn);
  wrapper.appendChild(buttonBar);

  container.appendChild(wrapper);

  const savedNote = localStorage.getItem("notes_app_saved");
  if (savedNote) {
    textarea.value = savedNote;
  }

  saveBtn.onclick = () => {
    localStorage.setItem("notes_app_saved", textarea.value);
  };
  context.eventBus.on("broadcast", (data) => {
    if (data.source !== "notes") {
      console.log("Notes received broadcast:", data.message);
    }
  });

  setInterval(() => {
    context.eventBus.emit("broadcast", {
      source: "notes",
      message: "Ping from Notes"
    });
  }, 10000);
};
window.apps.notes.windowSize = { width: "400px", height: "300px" };