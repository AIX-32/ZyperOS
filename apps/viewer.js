window.apps = window.apps || {};

window.apps.viewer = function(container, { eventBus }) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";
  container.style.padding = "10px";

  const title = document.createElement("h2");
  title.textContent = "Media Viewer";
  title.style.color = "#eee";
  container.appendChild(title);

  let mediaElem = null;
  let currentUrl = null;
  let isPlaying = false;

  const info = document.createElement("div");
  info.style.marginTop = "8px";
  info.style.minHeight = "24px";
  container.appendChild(info);

  const controls = document.createElement("div");
  controls.style.marginTop = "12px";
  controls.style.display = "flex";
  controls.style.gap = "8px";
  controls.style.alignItems = "center";
  container.appendChild(controls);

  const selectBtn = document.createElement("button");
  selectBtn.textContent = "Select Media or Image File";
  styleButton(selectBtn);
  controls.appendChild(selectBtn);

  let playPauseBtn = null;
  let stopBtn = null;

  function clearControls() {
    if (playPauseBtn) controls.removeChild(playPauseBtn);
    if (stopBtn) controls.removeChild(stopBtn);
    playPauseBtn = null;
    stopBtn = null;
  }

  function createPlayControls() {
    clearControls();

    playPauseBtn = document.createElement("button");
    playPauseBtn.textContent = "Play";
    styleButton(playPauseBtn);

    stopBtn = document.createElement("button");
    stopBtn.textContent = "Stop";
    styleButton(stopBtn);

    controls.appendChild(playPauseBtn);
    controls.appendChild(stopBtn);

    playPauseBtn.onclick = () => {
      if (!mediaElem) return;
      if (isPlaying) {
        mediaElem.pause();
        playPauseBtn.textContent = "Play";
      } else {
        mediaElem.play();
        playPauseBtn.textContent = "Pause";
      }
      isPlaying = !isPlaying;
    };

    stopBtn.onclick = () => {
      if (!mediaElem) return;
      mediaElem.pause();
      mediaElem.currentTime = 0;
      playPauseBtn.textContent = "Play";
      isPlaying = false;
    };
  }

  function resetPlayer() {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      currentUrl = null;
    }
    if (mediaElem) {
      container.removeChild(mediaElem);
      mediaElem = null;
    }
    info.textContent = "";
    clearControls();
    isPlaying = false;
  }

  selectBtn.onclick = () => {
    eventBus.emit("file-select-request", (files) => {
      resetPlayer();

      if (!files || files.length === 0) {
        info.textContent = "⚠️ No file selected.";
        return;
      }

      const file = files[0];
      if (!file.content || !file.content.type) {
        info.textContent = "⚠️ File content invalid or missing.";
        return;
      }

      const mimeType = file.content.type;
      if (!/^image|audio|video/.test(mimeType)) {
        info.textContent = "⚠️ Unsupported file type.";
        return;
      }

      currentUrl = URL.createObjectURL(file.content);

      if (mimeType.startsWith("image")) {
        mediaElem = document.createElement("img");
        mediaElem.style.maxWidth = "100%";
        mediaElem.style.maxHeight = "70vh";
        mediaElem.style.border = "1px solid #444";
        mediaElem.style.marginTop = "10px";
        clearControls();
      } else if (mimeType.startsWith("audio")) {
        mediaElem = document.createElement("audio");
        mediaElem.src = currentUrl;
        mediaElem.style.marginTop = "10px";
        mediaElem.onended = () => {
          if (playPauseBtn) playPauseBtn.textContent = "Play";
          isPlaying = false;
        };
        createPlayControls();
      } else if (mimeType.startsWith("video")) {
        mediaElem = document.createElement("video");
        mediaElem.src = currentUrl;
        mediaElem.style.maxWidth = "100%";
        mediaElem.style.maxHeight = "50vh";
        mediaElem.style.marginTop = "10px";
        mediaElem.onended = () => {
          if (playPauseBtn) playPauseBtn.textContent = "Play";
          isPlaying = false;
        };
        createPlayControls();
      }

      container.insertBefore(mediaElem, info.nextSibling);
      info.textContent = `Loaded: ${file.path} (${mimeType})`;
    });
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

window.apps.viewer.windowSize = { width: "600px", height: "500px" };
