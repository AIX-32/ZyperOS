window.apps = window.apps || {};

window.apps.theme = function(container, { eventBus }) {
  container.innerHTML = "";

  const textarea = document.createElement("textarea");
  textarea.style.flex = "1";
  textarea.style.width = "94%";
  textarea.style.resize = "none";
  textarea.style.background = "#111";
  textarea.style.color = "#eee";
  textarea.style.border = "1px solid #444";
  textarea.style.padding = "10px";
  textarea.placeholder = "Enter CSS to apply globally here...";

  const applyBtn = document.createElement("button");
  applyBtn.textContent = "Apply Theme";
  applyBtn.style.marginTop = "10px";
  applyBtn.style.padding = "6px 12px";

  container.appendChild(textarea);
  container.appendChild(applyBtn);

  let styleEl = document.getElementById("xyleros-theme-style");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "xyleros-theme-style";
    document.head.appendChild(styleEl);
  }

  applyBtn.onclick = () => {
    const css = textarea.value.trim();
    styleEl.textContent = css;
    localStorage.setItem("xyleros-theme-css", css);
  };
};
window.apps.theme.windowSize = { width: "400px", height: "150px" };