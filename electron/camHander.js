// ipcHandler.js
import { ipcMain, BrowserWindow, app,desktopCapturer,screen } from 'electron'
// 这样改回 require 方式
import utils,{__dirname, _rootPath, _tempDir, _userDataDir,_out } from './common.js'
import { createRequire } from "module";
import camWindow from "./camWindow.js";
const createCamWindow = ($event, params) => {
  console.log(222, params.win);
  
  if (params.win === 'create') {
    camWindow.createcamWindow()
  } else if (params.win === 'close') {
    console.log(1111);
    camWindow.closecamWindow()
  }
}

function setupCamIpcHandlers() {
  // ipcMain.handle('ss-closeWin',createShotWindow)
}

export {setupCamIpcHandlers}
