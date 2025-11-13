// Local icon paths (served from assets/icons)
const DOCK_ICON_PATHS = {
  finder: "/assets/icons/Finder.png",
  safari: "/assets/icons/Safari.png",
  mail: "/assets/icons/Mail.png",
  notes: "/assets/icons/Notes.png",
  appstore: "/assets/icons/App Store.png",
  terminal: "/assets/icons/Terminal.png",
  preview: "/assets/icons/Preview.png",
  settings: "/assets/icons/Settings.png",
  folder: "/assets/icons/Folder.png",
  trash: "/assets/icons/Trash Empty.png",
};

// Resolve Dock icon from local assets
function resolveDockIcon(key) {
  return DOCK_ICON_PATHS[key] || "";
}

const WALLPAPERS = [
  { name: "Monterey", folder: "Monterey" },
  { name: "Ventura", folder: "Ventura" },
  { name: "Catalina", folder: "Catalina" },
];

function resolveWallpaperPath(name, variant) {
  const wallpaper = WALLPAPERS.find((item) => item.name === name);
  if (!wallpaper) return "";

  return `assets/wallpapers/${wallpaper.folder}/${name}-${variant}.png`;
}
