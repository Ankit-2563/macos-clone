const NOTES_STORAGE_KEY = "macosNotes";

const defaultNote = {
  id: "default-note",
  title: "Kairos Portfolio",
  body:
    "Explore our work at Kairos:\nhttps://www.kairosagency.xyz/\n\nFeel free to add your own notes here.",
  updatedAt: new Date().toISOString(),
};

const notesApp = {
  notes: [],
  selectedId: null,
  elements: {
    window: document.getElementById("notesWindow"),
    dockIcon: document.getElementById("notesIcon"),
    list: document.getElementById("notesList"),
    editor: document.getElementById("notesEditor"),
    updated: document.getElementById("notesUpdated"),
    count: document.getElementById("notesCount"),
    addButton: document.getElementById("notesAddButton"),
    deleteButton: document.getElementById("notesDeleteButton"),
  },

  init() {
    this.loadNotes();
    this.renderList();
    this.bindEvents();
    if (!this.selectedId && this.notes.length > 0) {
      this.selectNote(this.notes[0].id);
    }
  },

  bindEvents() {
    this.elements.addButton?.addEventListener("click", () => this.createNote());
    this.elements.deleteButton?.addEventListener("click", () => this.deleteNote());
    this.elements.editor?.addEventListener("input", (event) =>
      this.updateCurrentNote(event.target.value)
    );
  },

  loadNotes() {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY));
      if (Array.isArray(stored) && stored.length) {
        this.notes = stored;
      } else {
        this.notes = [defaultNote];
        this.saveNotes();
      }
    } catch (error) {
      console.error("Failed to load notes from storage:", error);
      this.notes = [defaultNote];
      this.saveNotes();
    }
  },

  saveNotes() {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(this.notes));
  },

  createNote() {
    const newNote = {
      id: crypto.randomUUID ? crypto.randomUUID() : `note-${Date.now()}`,
      title: "New Note",
      body: "",
      updatedAt: new Date().toISOString(),
    };
    this.notes.unshift(newNote);
    this.saveNotes();
    this.renderList();
    this.selectNote(newNote.id);
  },

  deleteNote() {
    if (!this.selectedId) return;
    this.notes = this.notes.filter((note) => note.id !== this.selectedId);
    if (this.notes.length === 0) {
      this.notes = [defaultNote];
    }
    this.saveNotes();
    this.renderList();
    this.selectNote(this.notes[0].id);
  },

  selectNote(id) {
    this.selectedId = id;
    const note = this.notes.find((item) => item.id === id);
    if (!note) return;

    this.elements.list
      .querySelectorAll(".notes-list-item")
      .forEach((item) => {
        item.classList.toggle("active", item.dataset.noteId === id);
      });

    this.elements.editor.value = note.body;
    this.elements.updated.textContent = this.formatDate(note.updatedAt);
  },

  updateCurrentNote(value) {
    if (!this.selectedId) return;
    const note = this.notes.find((item) => item.id === this.selectedId);
    if (!note) return;

    note.body = value;
    note.title = this.deriveTitle(value) || "New Note";
    note.updatedAt = new Date().toISOString();

    this.saveNotes();
    this.renderList();
    this.selectNote(note.id);
  },

  deriveTitle(content) {
    return content.split("\n").map((line) => line.trim())[0] || "";
  },

  formatDate(isoString) {
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(isoString));
    } catch {
      return "Recently";
    }
  },

  renderList() {
    if (!this.elements.list) return;
    this.elements.list.innerHTML = "";

    this.notes.forEach((note) => {
      const item = document.createElement("div");
      item.className = "notes-list-item";
      item.dataset.noteId = note.id;

      const title = document.createElement("div");
      title.className = "notes-list-item-title";
      title.textContent = note.title || "New Note";

      const preview = document.createElement("div");
      preview.className = "notes-list-item-preview";
      preview.textContent = note.body
        ? note.body.split("\n").slice(0, 2).join(" ")
        : "No additional text";

      item.appendChild(title);
      item.appendChild(preview);

      item.addEventListener("click", () => this.selectNote(note.id));

      this.elements.list.appendChild(item);
    });

    if (this.elements.count) {
      this.elements.count.textContent = String(this.notes.length);
    }

    if (this.selectedId) {
      const activeItem = this.elements.list.querySelector(
        `[data-note-id="${this.selectedId}"]`
      );
      if (activeItem) {
        activeItem.classList.add("active");
      }
    }
  },

  open() {
    this.elements.window?.classList.add("active");
    this.elements.dockIcon?.classList.add("open");
    if (!this.selectedId && this.notes.length > 0) {
      this.selectNote(this.notes[0].id);
    }
  },

  close() {
    this.elements.window?.classList.remove("active");
    this.elements.dockIcon?.classList.remove("open");
  },

  toggleMaximize() {
    if (!this.elements.window) return;
    const isMaximized = this.elements.window.dataset.maximized === "true";
    if (isMaximized) {
      this.elements.window.style.width = "980px";
      this.elements.window.style.height = "640px";
      this.elements.window.style.top = "56%";
      this.elements.window.style.left = "55%";
      this.elements.window.style.transform = "translate(-50%, -50%)";
      this.elements.window.dataset.maximized = "false";
    } else {
      this.elements.window.style.width = "100vw";
      this.elements.window.style.height = "100vh";
      this.elements.window.style.top = "0";
      this.elements.window.style.left = "0";
      this.elements.window.style.transform = "none";
      this.elements.window.dataset.maximized = "true";
    }
  },
};

function openNotesApp() {
  notesApp.open();
}

function closeNotesApp() {
  notesApp.close();
}

function minimizeNotesApp() {
  notesApp.close();
}

function maximizeNotesApp() {
  notesApp.toggleMaximize();
}

document.addEventListener("DOMContentLoaded", () => {
  notesApp.init();
});

