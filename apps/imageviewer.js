window.apps = window.apps || {};

window.apps.imageviewer = function(container, { eventBus }) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";
  container.style.padding = "10px";

  const title = document.createElement("h2");
  title.textContent = "Image Viewer";
  title.style.color = "#eee";
  container.appendChild(title);

  const img = document.createElement("img");
  img.style.maxWidth = "100%";
  img.style.maxHeight = "70vh";
  img.style.border = "1px solid #444";
  img.style.display = "none";
  img.style.marginTop = "10px";
  container.appendChild(img);

  const info = document.createElement("div");
  info.style.marginTop = "8px";
  info.style.minHeight = "24px";
  container.appendChild(info);

  const btnRow = document.createElement("div");
  btnRow.style.marginTop = "12px";
  btnRow.style.display = "flex";
  btnRow.style.gap = "8px";

  const selectBtn = document.createElement("button");
  selectBtn.textContent = "Select Image to View";
  styleButton(selectBtn);

  const clearBtn = document.createElement("button");
  clearBtn.textContent = "Clear";
  styleButton(clearBtn);

  btnRow.appendChild(selectBtn);
  btnRow.appendChild(clearBtn);
  container.appendChild(btnRow);

  let currentUrl = null;

  selectBtn.onclick = () => {
    eventBus.emit("file-select-request", async (files) => {
      if (!files || files.length === 0) {
        info.textContent = "⚠️ No file selected.";
        return;
      }

      const file = files[0];
      if (!file.type.startsWith("file")) {
        info.textContent = "⚠️ Selected item is not a file.";
        return;
      }
      if (!file.content) {
        info.textContent = "⚠️ File content missing.";
        return;
      }
      if (!file.content.type || !file.content.type.startsWith("image/")) {
        info.textContent = "⚠️ Selected file is not an image.";
        return;
      }

      if (currentUrl) URL.revokeObjectURL(currentUrl);

      currentUrl = URL.createObjectURL(file.content);
      img.src = currentUrl;
      img.style.display = "block";
      info.textContent = `Viewing: ${file.path} (${file.content.type})`;
    });
  };

  clearBtn.onclick = () => {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      currentUrl = null;
    }
    img.style.display = "none";
    img.src = "";
    info.textContent = "";
  };

  function styleButton(btn) {
    btn.style.background = "#222";
    btn.style.color = "#eee";
    btn.style.border = "1px solid #555";
    btn.style.padding = "6px 12px";
    btn.style.cursor = "pointer";
    btn.style.fontFamily = "monospace";
    btn.onmouseenter = () => btn.style.background = "#333";
    btn.onmouseleave = () => btn.style.background = "#222";
  }
};
