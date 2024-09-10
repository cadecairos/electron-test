import path from 'node:path'

import { app, shell, ipcMain, dialog, BrowserWindow, type MessageBoxOptions, type IpcMainInvokeEvent } from 'electron'
import squirrelStartup from 'electron-squirrel-startup'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit()
}

const title = 'postman-test title'
const isTest = process.env.NODE_ENV === 'test'
const isDev = process.env.NODE_ENV === 'dev'
if (isTest) {
  import('wdio-electron-service/main')
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title,
    resizable: false,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))
  mainWindow.setTitle(title)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  })

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  ipcMain.on('dialog', (_: any, params: MessageBoxOptions) => {
    dialog.showMessageBox(params);
  });

  ipcMain.handle('wdio-electron', (_: IpcMainInvokeEvent, cmd: string) => {
    if (cmd === 'openChatWindow') {
      mainWindow.loadURL('https://socketio-chat-h9jt.herokuapp.com/')
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// set correct icon during development on macOS
if (process.platform === 'darwin') {
  app.dock.setIcon(path.join(__dirname, 'assets', 'icon', 'webdriverio.png'))
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
