// ipcHandler.js
import { ipcMain, BrowserWindow, app,desktopCapturer,screen } from 'electron'
// 这样改回 require 方式
import utils,{__dirname, _rootPath, _tempDir, _userDataDir,_out } from './common.js'
import { createRequire } from "module";
import screenshotWindow from "./screenshotWindow.js";
const createShotWindow = ($event, params) => {
  console.log(222, params.win);
  
  if (params.win === 'create') {
    screenshotWindow.createScreenshotWindow()
  } else if (params.win === 'close') {
    console.log(1111);
    screenshotWindow.closeScreenshotWindow()
  }
}

function setupScreenshotIpcHandlers() {
  // ipcMain.handle('ss-closeWin',createShotWindow)
}

export {setupScreenshotIpcHandlers}
