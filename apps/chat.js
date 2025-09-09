window.apps["chat"] = function(container, context) {
  container.className = "app-container";

  const userDiv = document.createElement("div");
  userDiv.className = "app-flex-row";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "Enter your username";
  usernameInput.className = "app-input";

  const usernameBtn = document.createElement("button");
  usernameBtn.textContent = "Set Username";
  usernameBtn.className = "app-button";

  userDiv.appendChild(usernameInput);
  userDiv.appendChild(usernameBtn);

  container.appendChild(userDiv);

  const chatDiv = document.createElement("div");
  chatDiv.className = "app-chat-container";

  container.appendChild(chatDiv);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Send message to all apps";
  input.className = "app-input";
  input.disabled = true;
  container.appendChild(input);

  let username = "";
  // Store user's sent messages
  const messageHistory = [];
  let historyIndex = -1;

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
      // Store message in history when sending
      messageHistory.push(input.value);
      historyIndex = messageHistory.length;
      
      context.eventBus.emit("broadcast", { source: username, message: input.value });
      input.value = "";
    }
    // Handle up arrow key to copy last message
    else if (e.key === "ArrowUp" && messageHistory.length > 0) {
      e.preventDefault(); // Prevent cursor from moving to beginning of input
      if (historyIndex > 0) {
        historyIndex--;
        input.value = messageHistory[historyIndex];
      }
    }
    // Handle down arrow key to navigate through history
    else if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevent cursor from moving to end of input
      if (historyIndex < messageHistory.length - 1) {
        historyIndex++;
        input.value = messageHistory[historyIndex];
      } else {
        historyIndex = messageHistory.length;
        input.value = "";
      }
    }
  };
};
window.apps.chat.windowSize = { width: "400px", height: "300px" };