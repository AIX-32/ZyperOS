window.apps = window.apps || {};

window.apps["notes"] = function(container, context) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.height = "100%";

  const textarea = document.createElement("textarea");
  textarea.style.flex = "1";
  textarea.style.width = "98%";
  textarea.style.resize = "none";
  textarea.style.background = "#111";
  textarea.style.color = "#eee";
  textarea.style.border = "1px solid #444";
  textarea.style.padding = "10px";
  textarea.style.margin = "4px auto";
  textarea.placeholder = "Type your notes here...";
  wrapper.appendChild(textarea);

  const buttonBar = document.createElement("div");
  buttonBar.style.textAlign = "right";
  buttonBar.style.paddingTop = "8px";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.style.padding = "5px 10px";
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
