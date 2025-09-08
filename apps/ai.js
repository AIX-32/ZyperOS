window.apps["ai"] = function(container, context) {
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";

  const title = document.createElement("h2");
  title.textContent = "AI Assistant";
  title.style.marginTop = "0";
  container.appendChild(title);

  const description = document.createElement("p");
  description.textContent = "Ask me anything! I can help with general questions or execute system commands.";
  description.style.marginTop = "0";
  description.style.color = "#ccc";
  container.appendChild(description);

  const chatDiv = document.createElement("div");
  chatDiv.style.flex = "1";
  chatDiv.style.overflowY = "auto";
  chatDiv.style.background = "#111";
  chatDiv.style.padding = "10px";
  chatDiv.style.color = "#eee";
  chatDiv.style.fontFamily = "monospace";
  chatDiv.style.marginBottom = "8px";
  container.appendChild(chatDiv);

  const inputDiv = document.createElement("div");
  inputDiv.style.display = "flex";
  inputDiv.style.gap = "8px";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ask me something...";
  input.style.flex = "1";
  input.style.padding = "6px";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Ask";
  sendBtn.style.padding = "6px 12px";
  sendBtn.style.cursor = "pointer";

  inputDiv.appendChild(input);
  inputDiv.appendChild(sendBtn);
  container.appendChild(inputDiv);

  function addMessage(role, message) {
    const msgDiv = document.createElement("div");
    msgDiv.style.marginBottom = "8px";
    
    const roleSpan = document.createElement("span");
    roleSpan.style.fontWeight = "bold";
    roleSpan.style.color = role === "You" ? "#4CAF50" : "#2196F3";
    roleSpan.textContent = role + ": ";
    
    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;
    
    msgDiv.appendChild(roleSpan);
    msgDiv.appendChild(messageSpan);
    chatDiv.appendChild(msgDiv);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  function executeCommand(command) {
    // Display the command being executed
    addMessage("System", `Executing command: ${command}`);
    
    // Process the command through the existing command handler
    try {
      // Use the global handleCommand function
      handleCommand(command);
      addMessage("System", "Command executed successfully");
    } catch (error) {
      addMessage("System", `Error executing command: ${error.message}`);
    }
  }

  async function askAI(question) {
    // Show loading message
    const loadingMsg = document.createElement("div");
    loadingMsg.textContent = "AI is thinking...";
    loadingMsg.style.color = "#FF9800";
    loadingMsg.style.fontStyle = "italic";
    chatDiv.appendChild(loadingMsg);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    try {
      // First AI: General conversation with system context
      const conversationResponse = await puter.ai.chat([
        {
          role: "system",
          content: `You are a helpful AI assistant for ZyperOS, a web-based operating system. 
          You can help users with general questions and also help them use ZyperOS commands.
          Available apps: notes, calc, chat, scripter, appbuilder, explorer, viewer, browser, theme, taskmgr, clock, uploader, music, ai
          Available commands: help, clear, open [app], apps, openall, matrix, ai
          When users ask to open apps or perform system actions, be helpful but also mention that you'll translate their request into a system command. Do not talk too much.`
        },
        {
          role: "user",
          content: question
        }
      ], {
        model: "gpt-4o-mini",
      });
      
      // Remove loading message
      chatDiv.removeChild(loadingMsg);
      
      // Display first AI's response
      addMessage("AI", conversationResponse);
      
      // Second AI: Command interpretation
      const commandPrompt = `You are an AI that translates natural language requests into ZyperOS system commands.
      The available commands are: help, clear, open [app], apps, openall, matrix, ai
      The available apps are: notes, calc, chat, scripter, appbuilder, explorer, viewer, browser, theme, taskmgr, clock, uploader, music, ai
      Respond ONLY with the exact command to execute, or "none" if no command is needed.
      Examples:
      User: "open the calculator"
      Response: "open calc"
      
      User: "show me all apps"
      Response: "apps"
      
      User: "what time is it"
      Response: "open clock"
      
      User: "hello there"
      Response: "none"
      
      Request: ${question}`;
      
      const commandResponse = await puter.ai.chat([
        {
          role: "system",
          content: commandPrompt
        }
      ], {
        model: "gpt-4o-mini",
      });
      
      // Check if commandResponse is a string
      let command = "none";
      if (typeof commandResponse === 'string') {
        command = commandResponse.trim();
      } else if (commandResponse && typeof commandResponse === 'object' && commandResponse.text) {
        // Handle case where response is an object with a text property
        command = commandResponse.text.trim();
      } else if (commandResponse && typeof commandResponse.toString === 'function') {
        // Handle other object types that can be converted to string
        command = commandResponse.toString().trim();
      }
      
      if (command !== "none" && command !== "") {
        // Execute the command
        executeCommand(command);
      }

    } catch (error) {
      // Remove loading message if it still exists
      if (loadingMsg.parentNode) {
        chatDiv.removeChild(loadingMsg);
      }
      addMessage("System", `Error: ${error.message}`);
    }
  }

  sendBtn.onclick = () => {
    if (input.value.trim()) {
      const question = input.value.trim();
      addMessage("You", question);
      input.value = "";
      askAI(question);
    }
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      const question = input.value.trim();
      addMessage("You", question);
      input.value = "";
      askAI(question);
    }
  };
  
  // Store the context for command execution
  context.aiContext = context;
};

window.apps.ai.windowSize = { width: "500px", height: "400px" };