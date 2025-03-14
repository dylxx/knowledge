
import  { app, BrowserWindow, Menu, globalShortcut,Tray, ipcMain } from 'electron'
import {setupIpcHandlers} from './ipcHander.js'
import { deleteFilesInDirectory, __dirname } from './common.js'
import path from 'path'
import {getWindow, createWindow} from './createWindow.js'
import {init} from './init.js'

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

console.log(111111, __dirname);

console.log(22222, path.join(__dirname, 'temp'));

deleteFilesInDirectory( path.join(__dirname, 'temp'))
init()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})