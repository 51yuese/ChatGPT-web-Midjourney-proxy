const path = require('path')
const { app, protocol, BrowserWindow, globalShortcut } = require('electron')
const { ipcMain } = require('electron')

app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

let mainWindow = null
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 860,
    minWidth: 1300,
    minHeight: 820,
    center: true,
    frame: false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  })
  mainWindow.setMenu(null)
  if (app.isPackaged) {
    // mainWindow.loadFile(`file://${path.join(__dirname, '../dist/index.html')}`)
    // const filePath = path.resolve(__dirname, '../dist/index.html')
    // mainWindow.loadFile(filePath)
    mainWindow.loadURL('https://ai.jiangly.com')
  }
  else {
    mainWindow.loadURL('http://127.0.0.1:1002')
    mainWindow.webContents.openDevTools()
  }
  globalShortcut.register('CommandOrControl+Shift+i', () => {
    mainWindow.webContents.openDevTools()
  })
}

/* ipc */
function handleIpc() {
  ipcMain.handle('minimizeWindow', (e) => {
    mainWindow?.minimize()
  })
  ipcMain.handle('maxmizeWindow', (e) => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (process.platform === 'darwin')
        mainWindow?.setFullScreen(true)

      else
        mainWindow?.maximize()
    }
  })
  ipcMain.handle('closeWindow', (e) => {
    mainWindow?.close()
  })
  ipcMain.handle('unmaximizeWindow', (e) => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (process.platform === 'darwin')
        mainWindow?.setFullScreen(false)
      else
        mainWindow?.unmaximize()
    }
  })
}

app.on('ready', () => {
  handleIpc()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})
