const { app, BrowserWindow, shell } = require("electron");
const childProcess = require("node:child_process");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");
const ollamaPort = 11434;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function createStaticServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const filePath = resolveStaticPath(url.pathname);

    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath)] ?? "application/octet-stream",
      });
      response.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

function resolveStaticPath(pathname) {
  let requestedPath;
  try {
    requestedPath = pathname === "/" ? "index.html" : decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = requestedPath.replace(/^[/\\]+/, "");
  const filePath = path.resolve(projectRoot, relativePath);
  const relativeToRoot = path.relative(projectRoot, filePath);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) return null;
  return filePath;
}

async function createWindow() {
  ensureOllamaStarted();
  const { url } = await createStaticServer();
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    title: "TEK17 Navigator",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  await window.loadURL(url);
}

function ensureOllamaStarted() {
  isOllamaReachable((isReachable) => {
    if (isReachable) return;

    const executable = findOllamaExecutable();
    if (!executable) return;

    try {
      const child = childProcess.spawn(executable, ["serve"], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      child.unref();
    } catch (error) {
      console.info("Kunne ikke starte Ollama automatisk.", error);
    }
  });
}

function isOllamaReachable(callback) {
  const request = http.get(
    {
      host: "127.0.0.1",
      port: ollamaPort,
      path: "/api/tags",
      timeout: 900,
    },
    (response) => {
      response.resume();
      callback(response.statusCode >= 200 && response.statusCode < 500);
    },
  );

  request.on("timeout", () => {
    request.destroy();
    callback(false);
  });
  request.on("error", () => callback(false));
}

function findOllamaExecutable() {
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Programs", "Ollama", "ollama.exe"),
    process.env.USERPROFILE && path.join(process.env.USERPROFILE, "AppData", "Local", "Programs", "Ollama", "ollama.exe"),
    "ollama",
  ].filter(Boolean);

  return candidates.find((candidate) => candidate === "ollama" || fs.existsSync(candidate));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
