let currentWallpaper = "Monterey";
let currentMode = "dynamic";
let currentSection = "general";

function loadWallpaperGrid() {
  const grid = document.getElementById("wallpaperGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  requestAnimationFrame(() => {
    WALLPAPERS.forEach((wallpaper) => {
      const item = document.createElement("div");
      item.className = "wallpaper-item";
      if (wallpaper.name === currentWallpaper) {
        item.classList.add("selected");
      }

      const preview = new Image();
      preview.src = resolveWallpaperPath(wallpaper.name, "light");
      preview.onload = () => {
        item.style.backgroundImage = `url('${preview.src}')`;
      };

      item.onclick = () => selectWallpaper(wallpaper.name);

      const label = document.createElement("div");
      label.className = "wallpaper-label";
      label.textContent = wallpaper.name;
      item.appendChild(label);

      grid.appendChild(item);
    });
  });
}

function selectWallpaper(name) {
  currentWallpaper = name;
  saveSettings();
  applyWallpaper();

  document.querySelectorAll(".wallpaper-item").forEach((item, index) => {
    item.classList.toggle("selected", WALLPAPERS[index].name === name);
  });
}

function applyWallpaper() {
  const hour = new Date().getHours();
  let variant = "light";

  if (currentMode === "dynamic") {
    variant = hour >= 18 || hour < 6 ? "dark" : "light";
  } else if (currentMode === "dark") {
    variant = "dark";
  }

  const wallpaperPath = resolveWallpaperPath(currentWallpaper, variant);
  const fallbackGradient =
    variant === "dark"
      ? "linear-gradient(135deg, #0f172a 0%, #1f2937 100%)"
      : "linear-gradient(135deg, #c0d9ff 0%, #f5f7ff 100%)";

  if (wallpaperPath) {
    const image = new Image();
    image.onload = () => {
      document.body.style.backgroundImage = `url('${wallpaperPath}')`;
    };
    image.onerror = () => {
      document.body.style.backgroundImage = fallbackGradient;
    };
    image.src = wallpaperPath;
  } else {
    document.body.style.backgroundImage = fallbackGradient;
  }
}

function updateTime() {
  const now = new Date();
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const timeElement = document.getElementById("current-time");
  if (timeElement) {
    timeElement.textContent = now.toLocaleString("en-US", options);
  }
}

function closeSettings() {
  document.getElementById("settingsWindow").classList.remove("active");
}

function saveSettings() {
  const settings = {
    wallpaper: currentWallpaper,
    mode: currentMode,
  };
  localStorage.setItem("macosSettings", JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem("macosSettings");
  if (!saved) {
    return;
  }

  try {
    const settings = JSON.parse(saved);
    currentWallpaper = settings.wallpaper || currentWallpaper;
    currentMode = settings.mode || currentMode;

    const radio = document.getElementById(`${currentMode}Mode`);
    if (radio) {
      radio.checked = true;
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

function switchSection(section) {
  currentSection = section;

  document.querySelectorAll(".settings-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === section);
  });

  const generalContent = document.getElementById("generalContent");
  const wallpaperContent = document.getElementById("wallpaperContent");
  const header = document.querySelector(".settings-header h1");
  const headerIcon = document.querySelector(".settings-header-icon");

  if (!generalContent || !wallpaperContent || !header || !headerIcon) {
    return;
  }

  if (section === "general") {
    generalContent.style.display = "block";
    wallpaperContent.style.display = "none";
    header.textContent = "General";
    headerIcon.innerHTML = "⚙️";
    headerIcon.style.background = "linear-gradient(145deg, #6b6b6b, #555)";
  } else if (section === "wallpaper") {
    generalContent.style.display = "none";
    wallpaperContent.style.display = "block";
    header.textContent = "Wallpaper";
    headerIcon.innerHTML = "🌄";
    headerIcon.style.background = "linear-gradient(145deg, #5ac8fa, #3a9fc5)";
  } else {
    generalContent.style.display = "none";
    wallpaperContent.style.display = "none";
    header.textContent = section.charAt(0).toUpperCase() + section.slice(1);
  }
}

function handleSearch(event) {
  const query = event.target.value.toLowerCase();
  document.querySelectorAll(".settings-item").forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = !query || text.includes(query) ? "flex" : "none";
  });
}

