function refreshDockIcons() {
  document.querySelectorAll("[data-dock-icon]").forEach((image) => {
    const key = image.dataset.dockIcon;
    const resolved = resolveDockIcon(key);
    if (resolved) {
      image.src = resolved;
    }
  });
}

function setupEventListeners() {
  const settingsIcon = document.getElementById("settingsIcon");
  if (settingsIcon) {
    settingsIcon.addEventListener("click", () => {
      document.getElementById("settingsWindow").classList.add("active");
    });
  }

  const terminalIcon = document.getElementById("terminalIcon");
  if (terminalIcon) {
    terminalIcon.addEventListener("click", () => {
      openTerminal();
    });
  }

  const notesIcon = document.getElementById("notesIcon");
  if (notesIcon) {
    notesIcon.addEventListener("click", () => {
      openNotesApp();
    });
  }

  const safariIcon = document.getElementById("safariIcon");
  if (safariIcon) {
    safariIcon.addEventListener("click", () => {
      window.open("https://www.kairosagency.xyz/", "_blank", "noopener");
    });
  }

  document.querySelectorAll(".settings-item").forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      switchSection(section);
    });
  });

  const searchInput = document.getElementById("settingsSearch");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }

  document
    .querySelectorAll('input[name="wallpaper-mode"]')
    .forEach((radio) => {
      radio.addEventListener("change", (event) => {
        currentMode = event.target.value;
        saveSettings();
        applyWallpaper();
      });
    });

  const settingsWindow = document.getElementById("settingsWindow");
  if (settingsWindow) {
    const closeControl = settingsWindow.querySelector(".window-control.close");
    if (closeControl) {
      closeControl.addEventListener("click", closeSettings);
    }
  }

  const terminalWindow = document.getElementById("terminalWindow");
  if (terminalWindow) {
    const controls = terminalWindow.querySelectorAll(".window-control");
    if (controls.length === 3) {
      const [closeBtn, minimizeBtn, maximizeBtn] = controls;
      closeBtn.addEventListener("click", closeTerminal);
      minimizeBtn.addEventListener("click", minimizeTerminal);
      maximizeBtn.addEventListener("click", maximizeTerminal);
    }
  }
}

function init() {
  fileSystem.load();
  loadSettings();
  loadWallpaperGrid();
  applyWallpaper();
  updateTime();
  refreshDockIcons();
  setupEventListeners();

  setInterval(updateTime, 60000);
  setInterval(() => {
    if (currentMode === "dynamic") {
      applyWallpaper();
    }
  }, 60000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

