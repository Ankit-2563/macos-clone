let terminalHistory = [];
let terminalHistoryIndex = -1;
let terminalInput = null;
let terminalInitialized = false;

const terminalCommands = {
  ls: () => {
    const files = fileSystem.listFiles();
    return files.length === 0 ? "No files found" : files.join("  ");
  },
  touch: (args) => {
    if (!args || args.length === 0) {
      return "Usage: touch <filename>";
    }
    const [filename, ...rest] = args;
    const content = rest.join(" ") || "";
    const result = fileSystem.createFile(filename, content);
    return result.success ? result.message : `Error: ${result.error}`;
  },
  rm: (args) => {
    if (!args || args.length === 0) {
      return "Usage: rm <filename>";
    }
    const [filename] = args;
    const result = fileSystem.deleteFile(filename);
    return result.success ? result.message : `Error: ${result.error}`;
  },
  cat: (args) => {
    if (!args || args.length === 0) {
      return "Usage: cat <filename>";
    }
    const [filename] = args;
    const file = fileSystem.getFile(filename);
    return file ? file.content || "(empty file)" : `Error: File ${filename} not found`;
  },
  echo: (args) => {
    if (!args || args.length === 0) {
      return "";
    }
    return args.join(" ");
  },
  clear: () => {
    const terminalBody = document.getElementById("terminalBody");
    terminalBody.innerHTML = "";
    return null;
  },
  write: (args) => {
    if (!args || args.length < 2) {
      return "Usage: write <file> <content>";
    }
    const [filename, ...rest] = args;
    const content = rest.join(" ");
    const file = fileSystem.getFile(filename);
    const result = file
      ? fileSystem.updateFile(filename, content)
      : fileSystem.createFile(filename, content);
    return result.success ? result.message : `Error: ${result.error}`;
  },
  help: () => {
    return `Available commands:
  ls                    - List files
  touch <file> [content] - Create a file (optionally with content)
  write <file> <content> - Write content to a file (creates if doesn't exist)
  rm <file>            - Delete a file
  cat <file>           - View file contents
  echo <text>          - Print text
  clear                - Clear terminal
  help                 - Show this help

Tip: Files created with 'touch' or 'write' will appear on the desktop.
     Double-click desktop files to view them, or right-click to delete.`;
  },
};

function openTerminal() {
  const terminalWindow = document.getElementById("terminalWindow");
  const terminalIcon = document.getElementById("terminalIcon");

  terminalWindow.classList.add("active");
  terminalIcon.classList.add("open");

  const terminalBody = document.getElementById("terminalBody");
  if (!terminalInitialized || terminalBody.children.length === 0) {
    terminalBody.innerHTML = "";
    addTerminalLine("Welcome to Terminal", "terminal-output");
    addTerminalLine("Type 'help' for available commands", "terminal-output");
    addTerminalPrompt();
    terminalInitialized = true;
  }

  setTimeout(() => {
    const input = document.querySelector(".terminal-input:not([disabled])");
    if (input) {
      input.focus();
    }
  }, 100);
}

function closeTerminal() {
  const terminalWindow = document.getElementById("terminalWindow");
  const terminalIcon = document.getElementById("terminalIcon");
  terminalWindow.classList.remove("active", "maximized");
  terminalIcon.classList.remove("open");
  terminalWindow.style.width = "";
  terminalWindow.style.height = "";
  terminalWindow.style.top = "";
  terminalWindow.style.left = "";
  terminalWindow.style.transform = "";
}

function minimizeTerminal() {
  closeTerminal();
}

function maximizeTerminal() {
  const terminalWindow = document.getElementById("terminalWindow");
  if (terminalWindow.classList.contains("maximized")) {
    terminalWindow.classList.remove("maximized");
    terminalWindow.style.width = "";
    terminalWindow.style.height = "";
    terminalWindow.style.top = "";
    terminalWindow.style.left = "";
    terminalWindow.style.transform = "";
  } else {
    terminalWindow.classList.add("maximized");
    terminalWindow.style.width = "100vw";
    terminalWindow.style.height = "100vh";
    terminalWindow.style.top = "0";
    terminalWindow.style.left = "0";
    terminalWindow.style.transform = "none";
  }
}

function addTerminalLine(text, className = "terminal-output") {
  const terminalBody = document.getElementById("terminalBody");
  const line = document.createElement("div");
  line.className = `terminal-line ${className}`;
  line.textContent = text;
  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function addTerminalPrompt() {
  const terminalBody = document.getElementById("terminalBody");
  const inputLine = document.createElement("div");
  inputLine.className = "terminal-line terminal-input-line";

  const prompt = document.createElement("span");
  prompt.className = "terminal-prompt";
  prompt.textContent = "$ ";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "terminal-input";
  input.autocomplete = "off";
  input.spellcheck = false;

  inputLine.appendChild(prompt);
  inputLine.appendChild(input);
  terminalBody.appendChild(inputLine);
  terminalBody.scrollTop = terminalBody.scrollHeight;

  input.focus();
  terminalInput = input;

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const command = input.value.trim();
      if (command) {
        terminalHistory.push(command);
        terminalHistoryIndex = terminalHistory.length;
        executeCommand(command);
      } else {
        input.disabled = true;
        input.style.display = "none";
        addTerminalPrompt();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (terminalHistoryIndex > 0) {
        terminalHistoryIndex -= 1;
        input.value = terminalHistory[terminalHistoryIndex];
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (terminalHistoryIndex < terminalHistory.length - 1) {
        terminalHistoryIndex += 1;
        input.value = terminalHistory[terminalHistoryIndex];
      } else {
        terminalHistoryIndex = terminalHistory.length;
        input.value = "";
      }
    }
  });
}

function executeCommand(command) {
  const terminalBody = document.getElementById("terminalBody");
  const lastInputLine = terminalBody.querySelector(".terminal-input-line");
  if (lastInputLine) {
    const input = lastInputLine.querySelector(".terminal-input");
    if (input) {
      input.disabled = true;
      input.style.display = "none";
      const commandDisplay = document.createElement("span");
      commandDisplay.textContent = command;
      commandDisplay.style.color = "#ffffff";
      lastInputLine.appendChild(commandDisplay);
      lastInputLine.classList.remove("terminal-input-line");
    }
  }

  const parts = command.split(" ");
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (terminalCommands[cmd]) {
    const result = terminalCommands[cmd](args);
    if (result !== null) {
      if (result.includes("Error:")) {
        addTerminalLine(result, "terminal-error");
      } else if (
        result.includes("created") ||
        result.includes("deleted") ||
        result.includes("updated")
      ) {
        addTerminalLine(result, "terminal-success");
      } else {
        result.split("\n").forEach((line) => {
          if (line.trim()) {
            addTerminalLine(line, "terminal-output");
          }
        });
      }
    } else {
      addTerminalPrompt();
      return;
    }
  } else {
    addTerminalLine(
      `Command not found: ${cmd}. Type 'help' for available commands.`,
      "terminal-error"
    );
  }

  addTerminalPrompt();
}

document.addEventListener("click", (event) => {
  if (event.target.closest(".terminal-window")) {
    const input = document.querySelector(".terminal-input:not([disabled])");
    if (input) {
      input.focus();
    }
  }
});

