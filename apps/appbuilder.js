window.apps["appbuilder"] = function(container, context) {
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";
  container.style.gap = "8px";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "App name (letters, numbers, underscores)";
  nameInput.style.padding = "6px";
  nameInput.style.fontSize = "14px";
  nameInput.style.borderRadius = "4px";
  nameInput.style.border = "1px solid #444";
  nameInput.style.background = "#111";
  nameInput.style.color = "#eee";

  const codeArea = document.createElement("textarea");
  codeArea.style.flex = "1";
  codeArea.style.background = "#111";
  codeArea.style.color = "#eee";
  codeArea.style.padding = "10px";
  codeArea.style.borderRadius = "4px";
  codeArea.style.border = "1px solid #444";
  codeArea.style.fontFamily = "monospace";
  codeArea.style.resize = "vertical";
  codeArea.style.minHeight = "200px";
  codeArea.placeholder = `// js code`;

  const statusMsg = document.createElement("div");
  statusMsg.style.minHeight = "24px";
  statusMsg.style.fontSize = "14px";
  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "8px";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Create App";
  saveBtn.style.padding = "6px 12px";
  saveBtn.style.background = "#222";
  saveBtn.style.color = "#eee";
  saveBtn.style.border = "1px solid #555";
  saveBtn.style.borderRadius = "4px";
  saveBtn.style.cursor = "pointer";
  saveBtn.style.flex = "1";

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear";
  clearBtn.style.padding = "6px 12px";
  clearBtn.style.background = "#222";
  clearBtn.style.color = "#eee";
  clearBtn.style.border = "1px solid #555";
  clearBtn.style.borderRadius = "4px";
  clearBtn.style.cursor = "pointer";

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(clearBtn);

  container.appendChild(nameInput);
  container.appendChild(codeArea);
  container.appendChild(btnRow);
  container.appendChild(statusMsg);

  function setStatus(text, success = true) {
    statusMsg.textContent = text;
    statusMsg.style.color = success ? "#0f0" : "#f55";
  }

  saveBtn.onclick = () => {
    const name = nameInput.value.trim();
    const code = codeArea.value.trim();

    if (!name) {
      setStatus("App name required", false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setStatus("Invalid app name: only letters, numbers, and underscores allowed", false);
      return;
    }
    if (!code) {
      setStatus("App code required", false);
      return;
    }

    try {
      const appFunc = new Function("container", "context", code);
      window.apps[name] = appFunc;
      setStatus(`App '${name}' created! You can now open it.`);
    } catch (e) {
      setStatus("Error in app code: " + e.message, false);
    }
  };

  clearBtn.onclick = () => {
    nameInput.value = "";
    codeArea.value = "";
    setStatus("");
  };
};
window.apps.appbuilder.windowSize = { width: "400px", height: "400px" };