const { app, BrowserWindow } = require("electron");

app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-dev-shm-usage");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);
