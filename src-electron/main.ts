const { app, BrowserWindow } = require('electron')
const path = require('path')

let win: typeof BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.loadFile(path.join(__dirname, '../dist/index.html'))

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
}

// Handle window-all-closed event differently based on platform
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

// Handle activate event for macOS
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.whenReady().then(createWindow) 