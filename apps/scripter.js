window.apps["scripter"] = function(container, context) {
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";
  container.style.gap = "10px";
  container.style.color = "#ccc";
  container.style.fontFamily = "'Fira Mono', 'Courier New', Courier, monospace";

  const textarea = document.createElement("textarea");
  Object.assign(textarea.style, {
    flex: "1",
    background: "#111",
    color: "#eee",
    border: "1px solid #444",
    padding: "12px",
    fontSize: "15px",
    outline: "none",
    borderRadius: "4px",
    fontFamily: container.style.fontFamily,
  });
  textarea.placeholder = "// Type JS code here";

  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const runBtn = document.createElement("button");
  runBtn.textContent = "Run";
  Object.assign(runBtn.style, {
    padding: "8px 16px",
    background: "#222",
    color: "#eee",
    border: "1px solid #555",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: container.style.fontFamily,
    borderRadius: "4px",
    userSelect: "none",
    transition: "background-color 0.3s ease",
  });
  runBtn.addEventListener("mouseenter", () => runBtn.style.background = "#333");
  runBtn.addEventListener("mouseleave", () => runBtn.style.background = "#222");

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear Output";
  Object.assign(clearBtn.style, {
    padding: "8px 16px",
    background: "#222",
    color: "#eee",
    border: "1px solid #555",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: container.style.fontFamily,
    borderRadius: "4px",
    userSelect: "none",
    transition: "background-color 0.3s ease",
  });
  clearBtn.addEventListener("mouseenter", () => clearBtn.style.background = "#333");
  clearBtn.addEventListener("mouseleave", () => clearBtn.style.background = "#222");

  const output = document.createElement("pre");
  Object.assign(output.style, {
    flex: "0 0 150px",
    background: "#111",
    color: "#0f0",
    padding: "12px",
    margin: "0",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    border: "1px solid #444",
    borderRadius: "4px",
    fontFamily: container.style.fontFamily,
  });

  runBtn.onclick = () => {
    runBtn.disabled = true;
    try {
      const result = eval(textarea.value);
      output.textContent = String(result);
    } catch (err) {
      output.textContent = "Error: " + err.message;
    }
    runBtn.disabled = false;
  };

  clearBtn.onclick = () => {
    output.textContent = "";
  };

  container.appendChild(textarea);
  btnContainer.appendChild(runBtn);
  btnContainer.appendChild(clearBtn);
  container.appendChild(btnContainer);
  container.appendChild(output);
};
