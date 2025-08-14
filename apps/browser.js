window.apps["browser"] = function(container, context) {
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.height = "100%";
    container.style.background = "#111";
    container.style.color = "#eee";
    container.style.fontFamily = "monospace";
  
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "8px";
    controls.style.padding = "10px";
  
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.placeholder = "Enter URL (include https://)";
    urlInput.style.flex = "1";
    urlInput.style.padding = "6px";
    urlInput.style.background = "#222";
    urlInput.style.border = "1px solid #444";
    urlInput.style.color = "#eee";
  
    const goBtn = document.createElement("button");
    goBtn.textContent = "Go";
    goBtn.style.padding = "6px 12px";
    goBtn.style.background = "#222";
    goBtn.style.color = "#eee";
    goBtn.style.border = "1px solid #444";
    goBtn.style.cursor = "pointer";
  
    const reloadBtn = document.createElement("button");
    reloadBtn.textContent = "Reload";
    reloadBtn.style.padding = "6px 12px";
    reloadBtn.style.background = "#222";
    reloadBtn.style.color = "#eee";
    reloadBtn.style.border = "1px solid #444";
    reloadBtn.style.cursor = "pointer";
  
    controls.appendChild(urlInput);
    controls.appendChild(goBtn);
    controls.appendChild(reloadBtn);
  
    const iframe = document.createElement("iframe");
    iframe.style.flex = "1";
    iframe.style.border = "1px solid #444";
    iframe.style.background = "#000";
  
    container.appendChild(controls);
    container.appendChild(iframe);
  
    function loadURL() {
      const url = urlInput.value.trim();
      if (!url) return;
      iframe.src = url;
    }
  
    goBtn.onclick = loadURL;
    urlInput.onkeydown = (e) => {
      if (e.key === "Enter") loadURL();
    };
    reloadBtn.onclick = () => {
      iframe.src = iframe.src;
    };
  };
  