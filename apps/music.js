window.apps = window.apps || {};

window.apps.music = function(container, { eventBus }) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";
  container.style.padding = "10px";

  const title = document.createElement("h2");
  title.textContent = "Music Player";
  title.style.color = "#eee";
  container.appendChild(title);

  const info = document.createElement("div");
  info.style.marginBottom = "10px";
  container.appendChild(info);

  // Add a little user instruction below title
  const instruction = document.createElement("div");
  instruction.textContent = "Click 'Load Songs' to select audio files from Zyper.";
  instruction.style.fontSize = "0.85em";
  instruction.style.color = "#999";
  instruction.style.marginBottom = "12px";
  container.insertBefore(instruction, info);

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.alignItems = "center";
  controls.style.gap = "8px";
  container.appendChild(controls);

  // Buttons
  const loadBtn = document.createElement("button");
  loadBtn.textContent = "Load Songs";
  styleButton(loadBtn);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  styleButton(prevBtn);

  const playPauseBtn = document.createElement("button");
  playPauseBtn.textContent = "Play";
  styleButton(playPauseBtn);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  styleButton(nextBtn);

  // Progress slider with label
  const progressContainer = document.createElement("div");
  progressContainer.style.flexGrow = "1";
  progressContainer.style.display = "flex";
  progressContainer.style.flexDirection = "column";
  progressContainer.style.fontSize = "0.75em";

  const progressLabel = document.createElement("div");
  progressLabel.textContent = "Progress";
  progressLabel.style.color = "#aaa";
  progressLabel.style.marginBottom = "2px";

  const progress = document.createElement("input");
  progress.type = "range";
  progress.min = 0;
  progress.max = 100;
  progress.value = 0;
  progress.style.width = "100%";

  progressContainer.appendChild(progressLabel);
  progressContainer.appendChild(progress);

  // Volume slider with label
  const volumeContainer = document.createElement("div");
  volumeContainer.style.width = "100px";
  volumeContainer.style.display = "flex";
  volumeContainer.style.flexDirection = "column";
  volumeContainer.style.fontSize = "0.75em";

  const volumeLabel = document.createElement("div");
  volumeLabel.textContent = "Volume";
  volumeLabel.style.color = "#aaa";
  volumeLabel.style.marginBottom = "2px";

  const volume = document.createElement("input");
  volume.type = "range";
  volume.min = 0;
  volume.max = 1;
  volume.step = 0.01;
  volume.value = 1;
  volume.style.width = "100%";

  volumeContainer.appendChild(volumeLabel);
  volumeContainer.appendChild(volume);

  controls.append(loadBtn, prevBtn, playPauseBtn, nextBtn, progressContainer, volumeContainer);

  let playlist = [];
  let currentTrackIndex = 0;
  let isPlaying = false;
  let audio = new Audio();

  function updateInfo() {
    if (playlist.length === 0) {
      info.textContent = "No songs loaded.";
    } else {
      const track = playlist[currentTrackIndex];
      // Show just filename (without full path)
      let name = track.path || "Unknown track";
      name = name.split("/").pop();
      info.textContent = `Now playing: ${name}`;
    }
  }

  async function loadTrack(index) {
    if (playlist.length === 0) return;
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentTrackIndex = index;
    if (playlist[index].content instanceof Blob) {
      audio.src = URL.createObjectURL(playlist[index].content);
      audio.load();
      updateInfo();
      progress.value = 0;
    } else {
      info.textContent = "Invalid audio content.";
    }
  }

  loadBtn.onclick = () => {
    eventBus.emit("file-select-request", files => {
      if (!files || files.length === 0) {
        info.textContent = "No files selected.";
        return;
      }
      playlist = files.filter(f => f.content && f.content.type.startsWith("audio"));
      if (playlist.length === 0) {
        info.textContent = "No audio files selected.";
        return;
      }
      currentTrackIndex = 0;
      loadTrack(currentTrackIndex);
    });
  };

  playPauseBtn.onclick = () => {
    if (!audio.src) return;
    if (isPlaying) {
      audio.pause();
      playPauseBtn.textContent = "Play";
    } else {
      audio.play();
      playPauseBtn.textContent = "Pause";
    }
    isPlaying = !isPlaying;
  };

  prevBtn.onclick = () => {
    if (playlist.length === 0) return;
    loadTrack(currentTrackIndex - 1);
    if (isPlaying) audio.play();
  };

  nextBtn.onclick = () => {
    if (playlist.length === 0) return;
    loadTrack(currentTrackIndex + 1);
    if (isPlaying) audio.play();
  };

  audio.ontimeupdate = () => {
    if (audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
    }
  };

  progress.oninput = () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
  };

  volume.oninput = () => {
    audio.volume = volume.value;
  };

  audio.onended = () => {
    nextBtn.onclick();
  };

  updateInfo();

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

window.apps.music.windowSize = { width: "600px", height: "220px" };
window.apps = window.apps || {};

window.apps.music = function(container, { eventBus }) {
  container.innerHTML = "";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.color = "#ccc";
  container.style.fontFamily = "monospace";
  container.style.padding = "10px";

  const info = document.createElement("div");
  info.style.marginBottom = "10px";
  container.appendChild(info);

  // Add a little user instruction below title
  const instruction = document.createElement("div");
  instruction.textContent = "Click 'Load Songs' to select audio files from your device.";
  instruction.style.fontSize = "0.85em";
  instruction.style.color = "#999";
  instruction.style.marginBottom = "12px";
  container.insertBefore(instruction, info);

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.alignItems = "center";
  controls.style.gap = "8px";
  container.appendChild(controls);

  // Buttons
  const loadBtn = document.createElement("button");
  loadBtn.textContent = "Load Songs";
  styleButton(loadBtn);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  styleButton(prevBtn);

  const playPauseBtn = document.createElement("button");
  playPauseBtn.textContent = "Play";
  styleButton(playPauseBtn);

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  styleButton(nextBtn);

  // Progress slider with label
  const progressContainer = document.createElement("div");
  progressContainer.style.flexGrow = "1";
  progressContainer.style.display = "flex";
  progressContainer.style.flexDirection = "column";
  progressContainer.style.fontSize = "0.75em";

  const progressLabel = document.createElement("div");
  progressLabel.textContent = "Progress";
  progressLabel.style.color = "#aaa";
  progressLabel.style.marginBottom = "2px";

  const progress = document.createElement("input");
  progress.type = "range";
  progress.min = 0;
  progress.max = 100;
  progress.value = 0;
  progress.style.width = "100%";

  progressContainer.appendChild(progressLabel);
  progressContainer.appendChild(progress);

  // Volume slider with label
  const volumeContainer = document.createElement("div");
  volumeContainer.style.width = "100px";
  volumeContainer.style.display = "flex";
  volumeContainer.style.flexDirection = "column";
  volumeContainer.style.fontSize = "0.75em";

  const volumeLabel = document.createElement("div");
  volumeLabel.textContent = "Volume";
  volumeLabel.style.color = "#aaa";
  volumeLabel.style.marginBottom = "2px";

  const volume = document.createElement("input");
  volume.type = "range";
  volume.min = 0;
  volume.max = 1;
  volume.step = 0.01;
  volume.value = 1;
  volume.style.width = "100%";

  volumeContainer.appendChild(volumeLabel);
  volumeContainer.appendChild(volume);

  controls.append(loadBtn, prevBtn, playPauseBtn, nextBtn, progressContainer, volumeContainer);

  let playlist = [];
  let currentTrackIndex = 0;
  let isPlaying = false;
  let audio = new Audio();

  function updateInfo() {
    if (playlist.length === 0) {
      info.textContent = "No songs loaded.";
    } else {
      const track = playlist[currentTrackIndex];
      // Show just filename (without full path)
      let name = track.path || "Unknown track";
      name = name.split("/").pop();
      info.textContent = `Now playing: ${name}`;
    }
  }

  async function loadTrack(index) {
    if (playlist.length === 0) return;
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentTrackIndex = index;
    if (playlist[index].content instanceof Blob) {
      audio.src = URL.createObjectURL(playlist[index].content);
      audio.load();
      updateInfo();
      progress.value = 0;
    } else {
      info.textContent = "Invalid audio content.";
    }
  }

  loadBtn.onclick = () => {
    eventBus.emit("file-select-request", files => {
      if (!files || files.length === 0) {
        info.textContent = "No files selected.";
        return;
      }
      playlist = files.filter(f => f.content && f.content.type.startsWith("audio"));
      if (playlist.length === 0) {
        info.textContent = "No audio files selected.";
        return;
      }
      currentTrackIndex = 0;
      loadTrack(currentTrackIndex);
    });
  };

  playPauseBtn.onclick = () => {
    if (!audio.src) return;
    if (isPlaying) {
      audio.pause();
      playPauseBtn.textContent = "Play";
    } else {
      audio.play();
      playPauseBtn.textContent = "Pause";
    }
    isPlaying = !isPlaying;
  };

  prevBtn.onclick = () => {
    if (playlist.length === 0) return;
    loadTrack(currentTrackIndex - 1);
    if (isPlaying) audio.play();
  };

  nextBtn.onclick = () => {
    if (playlist.length === 0) return;
    loadTrack(currentTrackIndex + 1);
    if (isPlaying) audio.play();
  };

  audio.ontimeupdate = () => {
    if (audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
    }
  };

  progress.oninput = () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 100) * audio.duration;
    }
  };

  volume.oninput = () => {
    audio.volume = volume.value;
  };

  audio.onended = () => {
    nextBtn.onclick();
  };

  updateInfo();

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

window.apps.music.windowSize = { width: "600px", height: "220px" };
