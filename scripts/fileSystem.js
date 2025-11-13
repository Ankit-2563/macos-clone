const fileSystem = {
  files: [],
  load() {
    const saved = localStorage.getItem("virtualFileSystem");
    if (saved) {
      try {
        this.files = JSON.parse(saved);
      } catch (error) {
        console.error("Unable to parse saved file system", error);
        this.files = [];
      }
    }
    this.updateDesktop();
  },
  save() {
    localStorage.setItem("virtualFileSystem", JSON.stringify(this.files));
    this.updateDesktop();
  },
  createFile(filename, content = "") {
    if (this.files.find((file) => file.name === filename)) {
      return { success: false, error: `File ${filename} already exists` };
    }
    const timestamp = new Date().toISOString();
    this.files.push({
      name: filename,
      content,
      type: "file",
      created: timestamp,
      modified: timestamp,
    });
    this.save();
    return { success: true, message: `File ${filename} created` };
  },
  updateFile(filename, content) {
    const file = this.files.find((item) => item.name === filename);
    if (!file) {
      return { success: false, error: `File ${filename} not found` };
    }
    file.content = content;
    file.modified = new Date().toISOString();
    this.save();
    return { success: true, message: `File ${filename} updated` };
  },
  deleteFile(filename) {
    const index = this.files.findIndex((item) => item.name === filename);
    if (index === -1) {
      return { success: false, error: `File ${filename} not found` };
    }
    this.files.splice(index, 1);
    this.save();
    return { success: true, message: `File ${filename} deleted` };
  },
  getFile(filename) {
    return this.files.find((item) => item.name === filename);
  },
  listFiles() {
    return this.files.map((item) => item.name);
  },
  updateDesktop() {
    const desktop = document.getElementById("desktop");
    if (!desktop) {
      return;
    }

    desktop.innerHTML = "";
    this.files.forEach((file) => {
      const fileElement = document.createElement("div");
      fileElement.className = "desktop-file";
      fileElement.dataset.filename = file.name;

      const icon = document.createElement("div");
      icon.className = "desktop-file-icon";
      icon.textContent = "📄";

      const name = document.createElement("div");
      name.className = "desktop-file-name";
      name.textContent = file.name;

      fileElement.appendChild(icon);
      fileElement.appendChild(name);

      fileElement.addEventListener("dblclick", () => {
        viewFile(file.name);
      });

      fileElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (confirm(`Delete ${file.name}?`)) {
          fileSystem.deleteFile(file.name);
        }
      });

      desktop.appendChild(fileElement);
    });
  },
};

function viewFile(filename) {
  const file = fileSystem.getFile(filename);
  if (file) {
    alert(`File: ${filename}\n\nContent:\n${file.content || "(empty)"}`);
  }
}

