const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;  // Better detection: true in dev/unpacked, false in packaged .exe

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,       // Security best practice
      contextIsolation: true,
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();  // Helpful for debugging
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Optional: prevent blank flash on load
  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
