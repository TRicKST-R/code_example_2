const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

let mainWindow

let dev = false
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    show: false,
    webPreferences: {
      webSecurity: false
    },
    icon: path.join(__dirname,'/src/', 'icon.png'),
    frame: false,
    //transparent: true
  })

  let indexPath
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:4000',
      pathname: 'index.html',
      slashes: true
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    })
  }
  mainWindow.loadURL( indexPath )

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if ( dev ) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  mainWindow.webContents.on('will-navigate', (e, url) => {
    e.preventDefault()
    mainWindow.webContents.send('open-file', url.slice(7))
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
