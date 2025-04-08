
import  { app, BrowserWindow, Menu, globalShortcut,Tray, ipcMain } from 'electron'
import log from "electron-log";
import dotenv from "dotenv";
import {setupIpcHandlers} from './ipcHander.js'
import utils,{ __dirname, _tempDir } from './common.js'
import path from 'path'
import {createWindow} from './createWindow.js'
import { windowManager } from "./windowManager.js";
import {init} from './init.js'
console.log = log.log
console.error = log.error
// 设置环境变量
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, ".env") // 打包后路径
  : path.join(__dirname, "../.env"); // 开发环境路径

// 解析 .env 文件
dotenv.config({ path: envPath });

let win
app.whenReady().then(() => {
  createWindow()
  win = windowManager.getWindow('mainWin')
  setupIpcHandlers()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

utils.deleteFilesInDirectory( _tempDir)
init()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})