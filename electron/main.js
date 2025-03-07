
const { app, BrowserWindow, Menu, globalShortcut,Tray, ipcMain } = require('electron')
const {setupIpcHandlers} = require('./ipcHander')
const { deleteFilesInDirectory } = require('./common.js')
const path = require('path')
const {getWindow, createWindow} = require('./createWindow.js')
const init = require('./init.js')

let win
app.whenReady().then(() => {
  createWindow()
  win = getWindow()
  setupIpcHandlers()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.handle('save-temp-file', async (event, filePath) => {
  const tempDir = app.getPath('temp'); // 获取临时目录路径
  const fileName = path.basename(filePath);
  const destPath = path.join(tempDir, fileName);

  return new Promise((resolve, reject) => {
    fs.copyFile(filePath, destPath, (err) => {
      if (err) {
        reject(err.message);
      } else {
        resolve(destPath);
      }
    });
  });
});

ipcMain.on('ondragstart', (event, filePath) => {
  console.log('path::::', filePath);
  
  event.sender.startDrag({
    file: filePath,
    icon: path.join(__dirname, 'assets/eye.png')
  })
})

deleteFilesInDirectory( path.join(__dirname, 'temp'))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})