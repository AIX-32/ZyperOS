window.apps = window.apps || {};

window.apps.viewer = function(container, { eventBus }) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";
  container.style.padding = "10px";

  const title = document.createElement("h2");
  title.textContent = "Media Player";
  title.style.color = "#eee";
  container.appendChild(title);

  let mediaElem = null;

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

  const playPauseBtn = document.createElement("button");
  playPauseBtn.textContent = "Play";
  playPauseBtn.disabled = true;
  styleButton(playPauseBtn);

  const stopBtn = document.createElement("button");
  stopBtn.textContent = "Stop";
  stopBtn.disabled = true;
  styleButton(stopBtn);

  controls.appendChild(selectBtn);
  controls.appendChild(playPauseBtn);
  controls.appendChild(stopBtn);

  let currentUrl = null;
  let isPlaying = false;

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
    playPauseBtn.disabled = true;
    stopBtn.disabled = true;
    playPauseBtn.textContent = "Play";
    isPlaying = false;
  }

  selectBtn.onclick = () => {
    eventBus.emit("file-select-request", (files) => {
      if (!files || files.length === 0) {
        info.textContent = "⚠️ No file selected.";
        resetPlayer();
        return;
      }

      const file = files[0];
      if (!file.type.startsWith("file")) {
        info.textContent = "⚠️ Selected item is not a file.";
        resetPlayer();
        return;
      }
      if (!file.content) {
        info.textContent = "⚠️ File content missing.";
        resetPlayer();
        return;
      }

      const mimeType = file.content.type;
      if (!mimeType.startsWith("image") && !mimeType.startsWith("audio") && !mimeType.startsWith("video")) {
        info.textContent = "⚠️ File is not image, audio, or video.";
        resetPlayer();
        return;
      }

      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentUrl = URL.createObjectURL(file.content);

      if (mediaElem) {
        container.removeChild(mediaElem);
        mediaElem = null;
      }

      if (mimeType.startsWith("image")) {
        mediaElem = document.createElement("img");
        mediaElem.style.maxWidth = "100%";
        mediaElem.style.maxHeight = "70vh";
        mediaElem.style.border = "1px solid #444";
        mediaElem.style.marginTop = "10px";
        mediaElem.src = currentUrl;
        playPauseBtn.disabled = true;
        stopBtn.disabled = true;
      } else if (mimeType.startsWith("audio")) {
        mediaElem = document.createElement("audio");
        mediaElem.src = currentUrl;
        mediaElem.style.marginTop = "10px";
        playPauseBtn.disabled = false;
        stopBtn.disabled = false;
        playPauseBtn.textContent = "Play";
        isPlaying = false;

        mediaElem.onended = () => {
          playPauseBtn.textContent = "Play";
          isPlaying = false;
        };
      } else if (mimeType.startsWith("video")) {
        mediaElem = document.createElement("video");
        mediaElem.src = currentUrl;
        mediaElem.style.maxWidth = "100%";
        mediaElem.style.maxHeight = "50vh";
        mediaElem.style.marginTop = "10px";
        mediaElem.controls = false;
        playPauseBtn.disabled = false;
        stopBtn.disabled = false;
        playPauseBtn.textContent = "Play";
        isPlaying = false;

        mediaElem.onended = () => {
          playPauseBtn.textContent = "Play";
          isPlaying = false;
        };
      }

      container.insertBefore(mediaElem, info.nextSibling);

      info.textContent = `Loaded: ${file.path} (${mimeType})`;
    });
  };

  playPauseBtn.onclick = () => {
    if (!mediaElem) return;
    if (mediaElem.tagName === "IMG") return; // no play/pause for images

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
    if (mediaElem.tagName === "IMG") return;

    mediaElem.pause();
    mediaElem.currentTime = 0;
    playPauseBtn.textContent = "Play";
    isPlaying = false;
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