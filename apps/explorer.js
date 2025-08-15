window.apps = window.apps || {};

window.apps.explorer = function(container, {eventBus}) {
  container.innerHTML = "";

  let db;
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("WebOS_FileSystem", 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("files")) {
          const store = db.createObjectStore("files", { keyPath: "path" });
          store.createIndex("by_type", "type", {unique: false});
        }
      };
      req.onsuccess = e => {
        db = e.target.result;
        resolve();
      };
      req.onerror = e => reject(e.target.error);
    });
  };
  
  eventBus.on("file-save-request", async ({ path, content, type }) => {
    await saveFile(path, content, type);
    await renderFiles();
  });

  function transaction(storeName, mode) {
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  async function saveFile(path, content, type) {
    return new Promise((res, rej) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const putReq = store.put({path, content, type});
      putReq.onsuccess = () => res();
      putReq.onerror = e => rej(e.target.error);
    });
  }

  async function deleteFile(path) {
    return new Promise((res, rej) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const delReq = store.delete(path);
      delReq.onsuccess = () => res();
      delReq.onerror = e => rej(e.target.error);
    });
  }

  async function getAllFiles() {
    return new Promise((res, rej) => {
      const tx = db.transaction("files", "readonly");
      const store = tx.objectStore("files");
      const files = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
          files.push(cursor.value);
          cursor.continue();
        } else {
          res(files);
        }
      };
      cursorReq.onerror = e => rej(e.target.error);
    });
  }

  const header = document.createElement("div");
  header.style.marginBottom = "10px";

  const createTxtBtn = document.createElement("button");
  createTxtBtn.textContent = "New Text File";
  createTxtBtn.style.marginRight = "10px";

  const fileList = document.createElement("div");
  fileList.style.maxHeight = "300px";
  fileList.style.overflowY = "auto";
  fileList.style.border = "1px solid #444";
  fileList.style.padding = "5px";
  fileList.style.background = "#111";

  container.appendChild(header);
  container.appendChild(fileList);

  header.appendChild(createTxtBtn);

  const nameModal = createModal("Enter new text file name");
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.style.width = "100%";
  nameInput.style.marginTop = "10px";
  nameModal.content.appendChild(nameInput);

  const nameSubmitBtn = document.createElement("button");
  nameSubmitBtn.textContent = "Create";
  nameSubmitBtn.style.marginTop = "10px";
  nameModal.content.appendChild(nameSubmitBtn);

  nameSubmitBtn.onclick = async () => {
    const name = nameInput.value.trim();
    if (!name) {
      setModalError(nameModal, "Name cannot be empty.");
      return;
    }
    const exists = (await getAllFiles()).find(f => f.path === name);
    if (exists) {
      setModalError(nameModal, "File already exists.");
      return;
    }
    await saveFile(name, "", "file");
    await renderFiles();
    nameModal.modal.style.display = "none";
    nameInput.value = "";
    clearModalError(nameModal);
  };

  createTxtBtn.onclick = () => {
    clearModalError(nameModal);
    nameInput.value = "";
    nameModal.modal.style.display = "flex";
    nameInput.focus();
  };

  function setModalError(modalObj, msg) {
    if (!modalObj.error) {
      modalObj.error = document.createElement("div");
      modalObj.error.style.color = "#f44";
      modalObj.error.style.marginTop = "10px";
      modalObj.content.appendChild(modalObj.error);
    }
    modalObj.error.textContent = msg;
  }
  function clearModalError(modalObj) {
    if (modalObj.error) {
      modalObj.error.textContent = "";
    }
  }

  function createModal(titleText) {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.background = "#222";
    modal.style.color = "#eee";
    modal.style.padding = "15px";
    modal.style.border = "1px solid #555";
    modal.style.zIndex = "50000";
    modal.style.display = "none";
    modal.style.flexDirection = "column";
    modal.style.minWidth = "300px";
    modal.style.maxWidth = "80vw";
    modal.style.boxShadow = "0 0 10px #000";

    const title = document.createElement("h3");
    title.textContent = titleText;
    modal.appendChild(title);

    const content = document.createElement("div");
    content.style.marginTop = "10px";
    modal.appendChild(content);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Cancel";
    closeBtn.style.alignSelf = "flex-end";
    closeBtn.style.marginTop = "10px";
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
    modal.appendChild(closeBtn);

    document.body.appendChild(modal);
    return {modal, content, closeBtn};
  }

  const deleteModal = createModal("Confirm Delete");
  const deleteMsg = document.createElement("div");
  deleteMsg.style.marginTop = "10px";
  deleteModal.content.appendChild(deleteMsg);

  const deleteConfirmBtn = document.createElement("button");
  deleteConfirmBtn.textContent = "Delete";
  deleteConfirmBtn.style.background = "#900";
  deleteConfirmBtn.style.color = "#fff";
  deleteConfirmBtn.style.marginRight = "10px";

  const deleteCancelBtn = document.createElement("button");
  deleteCancelBtn.textContent = "Cancel";

  const deleteBtnRow = document.createElement("div");
  deleteBtnRow.style.marginTop = "15px";
  deleteBtnRow.style.textAlign = "right";
  deleteBtnRow.appendChild(deleteConfirmBtn);
  deleteBtnRow.appendChild(deleteCancelBtn);
  deleteModal.content.appendChild(deleteBtnRow);

  let fileToDelete = null;

  function showDeleteConfirm(file) {
    fileToDelete = file;
    deleteMsg.textContent = `Delete "${file.path}"?`;
    deleteModal.modal.style.display = "flex";
  }

  deleteConfirmBtn.onclick = async () => {
    if (!fileToDelete) return;
    await deleteFile(fileToDelete.path);
    fileToDelete = null;
    deleteModal.modal.style.display = "none";
    await renderFiles();
  };

  deleteCancelBtn.onclick = () => {
    fileToDelete = null;
    deleteModal.modal.style.display = "none";
  };

  const editorModal = createModal("");
  editorModal.modal.style.maxHeight = "80vh";
  editorModal.modal.style.overflow = "auto";
  const editorTitle = editorModal.modal.querySelector("h3");
  const editorContent = document.createElement("div");
  editorContent.style.marginTop = "10px";
  editorModal.content.appendChild(editorContent);

  const editorTextarea = document.createElement("textarea");
  editorTextarea.style.width = "100%";
  editorTextarea.style.height = "200px";
  editorTextarea.style.background = "#111";
  editorTextarea.style.color = "#eee";
  editorTextarea.style.border = "1px solid #444";
  editorTextarea.style.display = "none";
  editorContent.appendChild(editorTextarea);

  const editorImg = document.createElement("img");
  editorImg.style.maxWidth = "100%";
  editorImg.style.maxHeight = "400px";
  editorImg.style.display = "none";
  editorImg.style.border = "1px solid #444";
  editorContent.appendChild(editorImg);

  const editorSaveBtn = document.createElement("button");
  editorSaveBtn.textContent = "Save";
  editorSaveBtn.style.marginRight = "10px";

  const editorCloseBtn = document.createElement("button");
  editorCloseBtn.textContent = "Close";

  const editorBtnRow = document.createElement("div");
  editorBtnRow.style.textAlign = "right";
  editorBtnRow.style.marginTop = "10px";
  editorBtnRow.appendChild(editorSaveBtn);
  editorBtnRow.appendChild(editorCloseBtn);
  editorModal.content.appendChild(editorBtnRow);

  let currentFile = null;

  function openFile(file) {
    currentFile = file;
    editorTitle.textContent = file.path;
    if (file.type === "file" && file.content instanceof Blob && file.content.type.startsWith("image/")) {
      editorTextarea.style.display = "none";
      editorImg.style.display = "block";
      editorImg.src = URL.createObjectURL(file.content);
      editorSaveBtn.style.display = "none";
    } else {
      editorTextarea.style.display = "block";
      editorImg.style.display = "none";
      if (typeof file.content === "string") editorTextarea.value = file.content;
      else editorTextarea.value = "";
      editorSaveBtn.style.display = "inline-block";
    }
    editorModal.modal.style.display = "flex";
  }

  editorSaveBtn.onclick = async () => {
    if (!currentFile) return;
    if (editorTextarea.style.display === "block") {
      await saveFile(currentFile.path, editorTextarea.value, "file");
      await renderFiles();
      editorModal.modal.style.display = "none";
    }
  };

  editorCloseBtn.onclick = () => {
    editorModal.modal.style.display = "none";
  };

  async function renderFiles() {
    fileList.innerHTML = "";
    const files = await getAllFiles();
    if (files.length === 0) {
      fileList.textContent = "No files yet. Drag & drop images or create text files.";
      return;
    }
    for (const f of files) {
      const fileRow = document.createElement("div");
      fileRow.style.display = "flex";
      fileRow.style.justifyContent = "space-between";
      fileRow.style.alignItems = "center";
      fileRow.style.padding = "4px 6px";
      fileRow.style.borderBottom = "1px solid #333";
      fileRow.style.color = "#ccc";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = f.path;
      nameSpan.style.cursor = "pointer";

      if (f.type === "file" && f.content instanceof Blob && f.content.type.startsWith("image/")) {
        const url = URL.createObjectURL(f.content);
        const img = document.createElement("img");
        img.src = url;
        img.style.height = "24px";
        img.style.marginRight = "8px";
        img.style.border = "1px solid #666";
        img.style.objectFit = "contain";
        nameSpan.prepend(img);
        
      }

      nameSpan.onclick = () => openFile(f);

      fileRow.appendChild(nameSpan);

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.title = "Delete file";
      delBtn.style.background = "transparent";
      delBtn.style.border = "none";
      delBtn.style.color = "#900";
      delBtn.style.cursor = "pointer";
      delBtn.onclick = e => {
        e.stopPropagation();
        showDeleteConfirm(f);
      };

      fileRow.appendChild(delBtn);

      fileList.appendChild(fileRow);
    }
  }

  container.ondragover = e => {
    e.preventDefault();
    container.style.border = "2px dashed #0f0";
  };
  container.ondragleave = e => {
    e.preventDefault();
    container.style.border = "";
  };
  container.ondrop = async e => {
    e.preventDefault();
    container.style.border = "";
    const files = e.dataTransfer.files;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        await saveFile(file.name, file, "file");
      } else {
      }
    }
    await renderFiles();
  };

  let fileSelectModal = null;
  eventBus.on("file-select-request", callback => {
    (async () => {
      await renderFiles();

      const files = await getAllFiles();
      if (files.length === 0) {
        callback([]);
        return;
      }

      if (!fileSelectModal) {
        fileSelectModal = createModal("Select a file");
        const list = document.createElement("div");
        list.style.maxHeight = "60vh";
        list.style.overflowY = "auto";
        fileSelectModal.content.appendChild(list);

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.marginTop = "10px";
        cancelBtn.onclick = () => {
          fileSelectModal.modal.style.display = "none";
          callback([]);
        };
        fileSelectModal.content.appendChild(cancelBtn);

        fileSelectModal.list = list;
      }

      fileSelectModal.list.innerHTML = "";

      files.forEach(f => {
        const item = document.createElement("div");
        item.textContent = f.path;
        item.style.padding = "5px";
        item.style.cursor = "pointer";
        item.style.borderBottom = "1px solid #444";
        item.onmouseenter = () => item.style.background = "#333";
        item.onmouseleave = () => item.style.background = "transparent";
        item.onclick = () => {
          fileSelectModal.modal.style.display = "none";
          callback([f]);
        };
        fileSelectModal.list.appendChild(item);
      });

      fileSelectModal.modal.style.display = "flex";
    })();
  });

  openDB()
    .then(renderFiles)
    .catch(e => {
      container.textContent = "Failed to open file system: " + e;
    });
};
window.apps.explorer.windowSize = { width: "400px", height: "300px" };

