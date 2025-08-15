window.apps["taskmgr"] = (root, { eventBus }) => {
  const refresh = () => {
    root.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Task Manager";
    root.appendChild(title);

    const taskButtons = document.querySelectorAll("#sidebar button");
    if (!taskButtons.length) {
      const msg = document.createElement("p");
      msg.textContent = "No running apps.";
      msg.style.color = "#aaa";
      root.appendChild(msg);
      return;
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.color = "#ccc";

    taskButtons.forEach(btn => {
      const appName = btn.textContent;

      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = appName;
      nameCell.style.padding = "5px";

      const btnCell = document.createElement("td");
      btnCell.style.textAlign = "right";

      const killBtn = document.createElement("button");
      killBtn.textContent = "Stop";
      killBtn.style.background = "#a00";
      killBtn.style.color = "#fff";
      killBtn.style.border = "none";
      killBtn.style.padding = "4px 8px";
      killBtn.style.cursor = "pointer";

      killBtn.onclick = () => {
        // Find and remove window with matching appName
        const windows = [...document.querySelectorAll(".window")];
        const win = windows.find(w => {
          const titleBar = w.querySelector(".titlebar span");
          return titleBar && titleBar.textContent === appName;
        });
        if (win) win.remove();

        // Remove taskbar button
        btn.remove();
        
        refresh(); // re-render the task list
      };

      btnCell.appendChild(killBtn);
      row.appendChild(nameCell);
      row.appendChild(btnCell);
      table.appendChild(row);
    });

    root.appendChild(table);
  };

  refresh();

  // Auto-refresh every 2 seconds
  const interval = setInterval(refresh, 2000);

  const parent = root.closest(".window");
  if (parent) {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(parent)) {
        clearInterval(interval);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  }
};
window.apps.taskmgr.windowSize = { width: "400px", height: "300px" };
