// ipcHandler.js
const { ipcMain, BrowserWindow } = require('electron')

function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    console.log('size: ', size);
    
    win.setSize(size.width, size.height)  // 调整窗口宽度为400，高度为动态计算的值
  }
}

function setupIpcHandlers() {
  ipcMain.handle('resize-window', resizeWindow)
}

module.exports = {
  setupIpcHandlers,
}
