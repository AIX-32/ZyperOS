  const output = document.getElementById("output");
  const form = document.getElementById("commandForm");
  const input = document.getElementById("commandInput");

  window.apps = window.apps || {};
  const openWindows = [];

  const eventBus = {
    listeners: {},
    on(event, cb) {
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(cb);
    },
    emit(event, data) {
      (this.listeners[event] || []).forEach(cb => cb(data));
    }
  };

  function print(msg) {
    const line = document.createElement("div");
    line.textContent = msg;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  const sidebar = document.createElement("div");
  sidebar.id = "sidebar";

  const title = document.createElement("div");
  title.id = "sidebar-title";
  title.textContent = "Executed:";

  const version = document.createElement("small");
  version.id = "sidebar-version";
  version.textContent = "0.8";

  sidebar.appendChild(title);
  sidebar.appendChild(version);

  document.body.appendChild(sidebar);

  let highestZ = 1000;

  function bringToFront(win) {
    // Skip if window is already at the top or set to stay on top
    if (win.style.zIndex === "99999") return;
    
    const currentZ = parseInt(win.style.zIndex) || 0;
    if (currentZ === highestZ) return;
    
    highestZ++;
    win.style.zIndex = highestZ;
  }

  function createWindow(title, launchApp, options = {}) {
    const win = document.createElement("div");
    win.className = "window";
    
    // Use app-defined or default size
    const width = options.width || "800px";
    const height = options.height || "600px";
    
    win.style.left = "170px";
    win.style.top = "50px";
    win.style.width = width;
    win.style.height = height;
    win.style.position = "absolute";
    win.style.zIndex = ++highestZ;

    // Track if window should stay on top
    let stayOnTop = false;

    const taskbarBtn = document.createElement("button");
    taskbarBtn.textContent = title;
    taskbarBtn.title = "Minimize/Restore";

    sidebar.appendChild(taskbarBtn);

    let minimized = false;

    taskbarBtn.onclick = () => {
      if (minimized) {
        win.style.display = "block";
        if (!stayOnTop) {
          bringToFront(win);
        }
        minimized = false;
      } else {
        win.style.display = "none";
        minimized = true;
      }
    };

    const titlebar = document.createElement("div");
    titlebar.className = "titlebar";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;

    // Create button container for titlebar buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "5px";
    buttonContainer.style.position = "absolute";
    buttonContainer.style.right = "10px";
    buttonContainer.style.top = "50%";
    buttonContainer.style.transform = "translateY(-50%)";

    // Minimize button
    const minimizeBtn = document.createElement("button");
    minimizeBtn.textContent = "−";
    minimizeBtn.title = "Minimize";
    minimizeBtn.className = "titlebar-button";
    minimizeBtn.onclick = () => {
      win.style.display = "none";
      minimized = true;
    };

    // Stay on top button
    const topBtn = document.createElement("button");
    topBtn.textContent = "↾";
    topBtn.title = "Stay on top";
    topBtn.className = "titlebar-button";
    topBtn.onclick = () => {
      // Toggle stay on top
      stayOnTop = !stayOnTop;
      if (stayOnTop) {
        win.style.zIndex = "99999";
        topBtn.textContent = "⇂";
        topBtn.title = "Release top";
      } else {
        win.style.zIndex = highestZ;
        topBtn.textContent = "↾";
        topBtn.title = "Stay on top";
      }
    };

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.title = "Close";
    closeBtn.className = "titlebar-button";
    closeBtn.onclick = () => {
      document.body.removeChild(win);
      sidebar.removeChild(taskbarBtn);
      const index = openWindows.indexOf(win);
      if (index !== -1) openWindows.splice(index, 1);
    };

    // Add buttons to container
    buttonContainer.appendChild(minimizeBtn);
    buttonContainer.appendChild(topBtn);
    buttonContainer.appendChild(closeBtn);

    titlebar.appendChild(titleSpan);
    titlebar.appendChild(buttonContainer);
    win.appendChild(titlebar);

    const content = document.createElement("div");
    content.className = "app-content";
    win.appendChild(content);

    let offsetX = 0, offsetY = 0;
    titlebar.onmousedown = function(e) {
      if (!stayOnTop) {
        bringToFront(win);
      }
      offsetX = e.clientX - win.offsetLeft;
      offsetY = e.clientY - win.offsetTop;

      // Disable text selection and pointer events on all elements during drag
      const style = document.createElement('style');
      style.id = 'drag-style';
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          pointer-events: none !important;
        }
        .window, .titlebar, .titlebar * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);

      function move(e) {
        // Use requestAnimationFrame for smoother dragging
        requestAnimationFrame(() => {
          let newX = e.clientX - offsetX;
          let newY = e.clientY - offsetY;

          newX = Math.max(newX, 150);
          newY = Math.max(newY, 0);

          const maxX = window.innerWidth - win.offsetWidth;
          const maxY = window.innerHeight - win.offsetHeight;

          newX = Math.min(newX, maxX);
          newY = Math.min(newY, maxY);

          win.style.left = newX + "px";
          win.style.top = newY + "px";
        });
      }

      function onMouseMove(e) {
        move(e);
      }

      function onMouseUp() {
        // Re-enable text selection and pointer events
        const dragStyle = document.getElementById('drag-style');
        if (dragStyle) {
          dragStyle.remove();
        }
        
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    win.onclick = () => {
      if (!stayOnTop) {
        bringToFront(win);
      }
    };

    document.body.appendChild(win);
    openWindows.push(win);

    launchApp(content, {eventBus});

    if (options.hidden) {
      win.style.display = 'none';
    }

    return win;
  }

  function handleCommand(raw) {
  const inputParts = raw.trim().split(" ");
  const cmd = inputParts[0];
  const args = inputParts.slice(1);

  switch (cmd) {
    case "help":
      print(getHelpText());
      break;
    case "clear":
      output.innerHTML = "";
      break;
    case "apps":
      print("Available apps:\n" + Object.keys(window.apps).join("\n"));
      break;
    case "open":
      const appName = args[0];
      if (!appName) {
        print("Usage: open [appName]");
      } else if (window.apps[appName]) {
        const appFn = window.apps[appName];
        const size = appFn.windowSize || {};
        createWindow(appName, appFn, size);
      } else {
        print(`App not found: ${appName}`);
      }
      break;
    case "testbutton":
      print("Example usage: midbutton (alert('Test Button Clicked!')) Test Button");
      print("Creating a test button now...");
      handleCommand("midbutton (alert('Test Button Clicked!')) Test Button");
      break;
    case "reloadbutton":
      print("Creating a reload button...");
      handleCommand("midbutton (location.reload()) Reload Page");
      break;
    case "midbutton":
      // Parse the command: midbutton (javascript code) button title
      const rawArgs = raw.trim().substring("midbutton".length).trim();
      // Match everything inside the first parentheses and everything after
      const jsMatch = rawArgs.match(/^\((.*)\)\s*(.+)$/);
      
      if (!jsMatch || jsMatch.length < 3) {
        print("Usage: midbutton (on click js) [button title]");
        print("Example: midbutton (alert('Hello World!')) My Button");
      } else {
        const onClickJs = jsMatch[1];
        const buttonTitle = jsMatch[2];
        
        // Create the button
        const button = document.createElement("button");
        button.textContent = buttonTitle;
        button.className = "midbutton"; // Use CSS class instead of inline styles
        // Add type to prevent form submission
        button.type = "button";
        
        // Add click event with the provided JavaScript
        button.onclick = () => {
          try {
            eval(onClickJs);
          } catch (err) {
            print("Error executing button script: " + err.message);
          }
        };
        
        // Add the button to the document body
        document.body.appendChild(button);
        print(`Button "${buttonTitle}" created at bottom center`);
      }
      break;
    default:
      print(`Unknown command: ${cmd}`);
      break;
    case "openall":
      Object.keys(window.apps).forEach(appName => {
        // Skip the matrix app
        if (appName === "matrix") return;
        
        const appFn = window.apps[appName];
        const size = appFn.windowSize || {};
        createWindow(appName, appFn, size);
      });
      break;
    case "matrix":
      openOrFocusApp("matrix");
      break;
    case "ai":
      openOrFocusApp("ai");
      break;
  }
}

// Add the midbutton command to the help text
function getHelpText() {
  return `Commands: 
  help - Show this help message
  clear - Clear the terminal output
  open [app] - Open an app (e.g., open calc)
  apps - List all available apps
  openall - Open all apps
  matrix - Show the matrix effect
  ai - Open the AI app
  midbutton (on click js) [button title] - Create a button at bottom center
    Example: midbutton (alert('Hello!')) Click Me
  testbutton - Create a test button to demonstrate functionality
  reloadbutton - Create a button that reloads the page`;
}

window.apps.matrix = function() {
    // Create fullscreen overlay
    const overlay = document.createElement("canvas");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "99999";
    overlay.style.pointerEvents = "none"; // so it doesn't block clicks
    document.body.appendChild(overlay);

    const ctx = overlay.getContext("2d");

    function resize() {
        overlay.width = window.innerWidth;
        overlay.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789あいうえおかきくけこさしすせそ";
    const fontSize = 16;
    const columns = Math.floor(overlay.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // fade effect
        ctx.fillRect(0, 0, overlay.width, overlay.height);

        ctx.fillStyle = "#fff"; // white letters
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > overlay.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    const interval = setInterval(draw, 50);

    // Clean up function
    return {
        destroy() {
            clearInterval(interval);
            window.removeEventListener("resize", resize);
            document.body.removeChild(overlay);
        }
    };
};


  // AI Mode state
  let aiMode = false;

  // Wait for DOM to be fully loaded before accessing elements
  document.addEventListener("DOMContentLoaded", function() {
    // Toggle button functionality
    const toggleButton = document.getElementById("toggleMode");
    const commandPrompt = document.getElementById("commandPrompt");
    const gradientBg = document.getElementById("gradientBg");
    
    // Add hover effects
    toggleButton.addEventListener("mouseenter", () => {
      if (!aiMode) {
        toggleButton.style.background = "#333";
      }
    });
    
    toggleButton.addEventListener("mouseleave", () => {
      if (!aiMode) {
        toggleButton.style.background = "#222";
      } else {
        toggleButton.style.background = "#555"; // Changed from green to dark gray
      }
    });
    
    toggleButton.addEventListener("click", (e) => {
      // Prevent form submission when clicking the toggle button
      e.preventDefault();
      aiMode = !aiMode;
      if (aiMode) {
        toggleButton.textContent = "AI";
        toggleButton.style.background = "#555"; // Changed from green to dark gray
        commandPrompt.textContent = "AI:";
        input.placeholder = "Ask AI something...";
        // Show gradient background
        gradientBg.classList.add("active");
      } else {
        toggleButton.textContent = "AI";
        toggleButton.style.background = "#222";
        commandPrompt.textContent = ">";
        input.placeholder = "Type a command...";
        // Hide gradient background
        gradientBg.classList.remove("active");
      }
    });
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const cmd = input.value;
    if (aiMode) {
      print("You: " + cmd);
      // Process with AI
      await processAICommand(cmd);
    } else {
      print("> " + cmd);
      handleCommand(cmd);
    }
    input.value = "";
  });

  // Add event listener for up arrow key to recall last command
  input.addEventListener("keydown", function(e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      // Get the last command from the output
      const commands = Array.from(output.querySelectorAll("div"));
      if (commands.length > 0) {
        // Find the last command that starts with ">" (user command) or "AI:"
        for (let i = commands.length - 1; i >= 0; i--) {
          const text = commands[i].textContent;
          if (text.startsWith("> ")) {
            // Extract the actual command (remove "> ")
            input.value = text.substring(2);
            break;
          } else if (text.startsWith("AI: ")) {
            // Extract the actual command (remove "AI: ")
            input.value = text.substring(4);
            break;
          }
        }
      }
    }
  });

  // Function to get command line history for AI context
  function getCommandLineHistory() {
    const commands = Array.from(output.querySelectorAll("div"));
    const history = [];
    
    commands.forEach(cmd => {
      const text = cmd.textContent;
      if (text.startsWith("> ") || text.startsWith("You: ") || text.startsWith("Zyper: ") || text.startsWith("AI is thinking") || text.startsWith("Executing command:") || text.startsWith("Command executed")) {
        history.push(text);
      }
    });
    
    // Limit history to last 20 entries to prevent token overflow
    return history.slice(-20).join("\n");
  }

  // AI command processing function
  async function processAICommand(question) {
    try {
      // Show loading message
      print("AI is thinking...");
      
      // Get command line history for context
      const commandHistory = getCommandLineHistory();
      
      // First AI: General conversation with system context
      const conversationResponse = await puter.ai.chat([
        {
          role: "system",
          content: `You are a helpful AI assistant for ZyperOS, a web-based operating system, your name is zyper you have emotions that you make up do not use emojis you should act as the OS but have emetions and talk. 
          You can help users with general questions and also help them use ZyperOS commands.
          Available apps: notes, calc, chat, scripter, appbuilder, explorer, viewer, browser, theme, taskmgr, clock, uploader, music, ai
          Available commands: help, clear, open [app], apps, openall, matrix, ai, midbutton (on click js) [button title]
          When users ask to open apps or perform system actions, be helpful but also mention that you'll translate their request into a system command.
          
          The midbutton command creates a button at the bottom center of the screen.
          Syntax: midbutton (JavaScript code) button title
          Example: midbutton (alert('Hello World!')) Click Me
          This creates a button labeled "Click Me" that shows an alert when clicked.
          
          COMMAND LINE HISTORY (for context):
          ${commandHistory}`
        },
        {
          role: "user",
          content: question
        }
      ], {
        model: "gpt-4o-mini",
      });
      
      // Display first AI's response
      print("Zyper: " + conversationResponse);
      
      // Second AI: Command interpretation
      const commandPrompt = `You are an AI that translates natural language requests into ZyperOS system commands.
      The available commands are: help, clear, open [app], apps, openall, matrix, ai, midbutton (on click js) [button title]
      The available apps are: notes, calc, chat, scripter, appbuilder, explorer, viewer, browser, theme, taskmgr, clock, uploader, music, ai
      Respond ONLY with the exact command to execute, or "none" if no command is needed. DO NOT use code blocks or any other formatting.
      
      COMMAND LINE HISTORY (for context):
      ${commandHistory}
      
      Examples:
      User: "open the calculator"
      Response: "open calc"
      
      User: "show me all apps"
      Response: "apps"
      
      User: "what time is it"
      Response: "open clock"
      
      User: "create a button that shows an alert"
      Response: "midbutton (alert('Button clicked!')) Alert Button"
      
      User: "make a button at the bottom that opens the calculator"
      Response: "midbutton (handleCommand('open calc')) Open Calculator"
      
      User: "make a button where it reloads the page"
      Response: "midbutton (location.reload()) Reload Page"
      
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
      
      // Remove markdown code blocks if present
      command = command.replace(/```.*\n?/g, '').trim();
      
      if (command !== "none" && command !== "") {
        // Execute the command
        print("Executing command: " + command);
        handleCommand(command);
        print("Command executed successfully");
      }
    } catch (error) {
      print("AI Error: " + error.message);
    }
  }

  function openOrFocusApp(appName) {

  let win = openWindows.find(w => w.dataset.appName === appName);
  if (win) {
    win.style.zIndex = Math.max(...openWindows.map(w => +w.style.zIndex)) + 1;
    return win;
  }
  const appFn = window.apps[appName];
  const size = appFn.windowSize || {};
  createWindow(appName, appFn, size);
  win = openWindows[openWindows.length - 1];
  win.dataset.appName = appName;
  return win;


  
}

function tryOpenBackgroundExplorer() {
  if (typeof createWindow === "function" && window.apps && window.apps.explorer) {
    // Create the explorer window in hidden state
    window.backgroundExplorer = createWindow("Explorer", window.apps.explorer, { hidden: true });
  } else {
    setTimeout(tryOpenBackgroundExplorer, 50);
  }
}

// Call this at startup
tryOpenBackgroundExplorer();

// Function user can call to show Explorer window
function showExplorer() {
  if (window.backgroundExplorer) {
    window.backgroundExplorer.style.display = "block";
    // Bring it to front if you want
    window.backgroundExplorer.style.zIndex = Math.max(...openWindows.map(w => +w.style.zIndex)) + 1;
  } else {
    // If not ready, just open normally
    if (window.apps && window.apps.explorer) {
      createWindow("Explorer", window.apps.explorer);
    }
  }
}

// Initialize start time
if (!window.osStartTime) window.osStartTime = Date.now();


  print("Booting ZyperOS...\nBooting Explorer...\nMake sure to star me on Github!\n\nType 'help' to begin.");
