window.apps = window.apps || {};

window.apps.uploader = function(container, { eventBus }) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.height = "100%";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";
  container.style.padding = "20px";
  container.style.background = "#111";
  container.style.userSelect = "none";

  const title = document.createElement("h2");
  title.textContent = window.apps.uploader.name;  // use the name property here
  title.style.marginBottom = "20px";
  container.appendChild(title);

  // Hidden file input
  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.multiple = true;
  uploadInput.style.display = "none";
  container.appendChild(uploadInput);

  // Custom styled upload button
  const uploadBtn = document.createElement("button");
  uploadBtn.textContent = "Select Files to Upload";
  uploadBtn.style.backgroundColor = "#333";
  uploadBtn.style.color = "#eee";
  uploadBtn.style.border = "1px solid #666";
  uploadBtn.style.padding = "10px";
  uploadBtn.style.borderRadius = "4px";
  uploadBtn.style.cursor = "pointer";
  uploadBtn.style.transition = "background-color 0.3s ease";
  uploadBtn.style.marginBottom = "15px";
  uploadBtn.onmouseenter = () => (uploadBtn.style.backgroundColor = "#555");
  uploadBtn.onmouseleave = () => (uploadBtn.style.backgroundColor = "#333");
  container.appendChild(uploadBtn);

  uploadBtn.onclick = () => {
    uploadInput.click();
  };

  const dropZone = document.createElement("div");
  dropZone.textContent = "Or drag & drop files here";
  dropZone.style.width = "99%";
  dropZone.style.height = "100px";
  dropZone.style.border = "2px dashed #555";
  dropZone.style.borderRadius = "6px";
  dropZone.style.display = "flex";
  dropZone.style.alignItems = "center";
  dropZone.style.justifyContent = "center";
  dropZone.style.color = "#777";
  dropZone.style.marginBottom = "15px";
  dropZone.style.transition = "border-color 0.3s, color 0.3s";
  container.appendChild(dropZone);

  const info = document.createElement("div");
  info.style.minHeight = "24px";
  info.style.textAlign = "center";
  container.appendChild(info);

  function setStatus(text, isError = false) {
    info.textContent = text;
    info.style.color = isError ? "#f44" : "#0f0";
  }

  async function saveFileWithTimeout(file) {
    return new Promise((res, rej) => {
      let done = false;

      function callback() {
        if (done) return;
        done = true;
        res();
      }

      try {
        eventBus.emit("file-save-request", {
          path: file.name,
          content: file,
          type: file.type || "file",
          callback,
        });
      } catch (e) {
        rej(e);
        return;
      }

      setTimeout(() => {
        if (!done) {
          done = true;
          res();
        }
      }, 2000);
    });
  }

  async function uploadFiles(files) {
    if (!files || files.length === 0) {
      setStatus("No files selected.", true);
      return;
    }

    uploadBtn.disabled = true;
    setStatus(`Uploading ${files.length} file(s)...`);

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        setStatus(`File too large: ${file.name}`, true);
        uploadBtn.disabled = false;
        return;
      }

      try {
        await saveFileWithTimeout(file);
      } catch (e) {
        setStatus(`Failed to upload ${file.name}: ${e}`, true);
        uploadBtn.disabled = false;
        return;
      }
    }

    setStatus(`Upload complete!`);
    uploadInput.value = "";
    uploadBtn.disabled = false;
  }

  uploadInput.addEventListener("change", () => {
    uploadFiles(uploadInput.files);
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#0f0";
    dropZone.style.color = "#0f0";
  });

  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#555";
    dropZone.style.color = "#777";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#555";
    dropZone.style.color = "#777";

    const files = e.dataTransfer.files;
    uploadFiles(files);
  });
};

window.apps.uploader.windowSize = { width: "400px", height: "250px" };
window.apps.uploader.name = "Uploader";
