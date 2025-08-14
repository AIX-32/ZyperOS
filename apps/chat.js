window.apps["chat"] = function(container, context) {
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";

  const userDiv = document.createElement("div");
  userDiv.style.marginBottom = "8px";
  userDiv.style.display = "flex";
  userDiv.style.gap = "8px";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "Enter your username";
  usernameInput.style.flex = "1";
  usernameInput.style.padding = "6px";

  const usernameBtn = document.createElement("button");
  usernameBtn.textContent = "Set Username";
  usernameBtn.style.padding = "6px 12px";
  usernameBtn.style.cursor = "pointer";

  userDiv.appendChild(usernameInput);
  userDiv.appendChild(usernameBtn);

  container.appendChild(userDiv);

  const chatDiv = document.createElement("div");
  chatDiv.style.flex = "1";
  chatDiv.style.overflowY = "auto";
  chatDiv.style.background = "#111";
  chatDiv.style.padding = "10px";
  chatDiv.style.color = "#eee";
  chatDiv.style.fontFamily = "monospace";

  container.appendChild(chatDiv);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Send message to all apps";
  input.style.width = "100%";
  input.style.marginTop = "8px";
  input.style.padding = "6px";
  input.disabled = true;
  container.appendChild(input);

  let username = "";

  function enableChat(name) {
    username = name.trim();
    if (!username) return;
    usernameInput.disabled = true;
    usernameBtn.disabled = true;
    input.disabled = false;
    input.focus();
  }

  usernameBtn.onclick = () => {
    if (usernameInput.value.trim()) {
      enableChat(usernameInput.value);
    }
  };

  usernameInput.onkeydown = (e) => {
    if (e.key === "Enter" && usernameInput.value.trim()) {
      enableChat(usernameInput.value);
    }
  };

  context.eventBus.on("broadcast", (data) => {
    const p = document.createElement("p");
    p.textContent = `[${data.source}]: ${data.message}`;
    chatDiv.appendChild(p);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });

  input.onkeydown = (e) => {
    if (e.key === "Enter" && input.value.trim() && username) {
      context.eventBus.emit("broadcast", { source: username, message: input.value });
      input.value = "";
    }
  };
};
