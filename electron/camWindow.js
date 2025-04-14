import { BrowserWindow, desktopCapturer, screen,globalShortcut,ipcMain } from 'electron';
import * as path from 'path';
import {setupCamIpcHandlers} from './camHander.js'
import utils,{ __dirname, _rootPath, _assetsDir,_tempDir } from './common.js'
import {windowManager} from "./windowManager.js";

export async function createCamWindow() {
  // 如果已有窗口，先关闭
  console.log('get');
  let camWin = windowManager.getWindow('camWin')
  console.log('close');
  
  if (camWin) await camWin.close()
  // 创建窗口
  const options = {
    width: 150,
    height: 150,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: false,
    hasShadow: false,
    skipTaskbar: false,
    resizable: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'camProload.cjs'), // 如需要
    },
  }
  // camWin.hookWindowMessage(0x0112, () => { // WM_SYSCOMMAND
  //   return true // 阻止默认行为
  // })
  console.log('create');
  camWin = windowManager.createWindow('camWin', options)
  camWin.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'camera']
    if (allowedPermissions.includes(permission)) {
      callback(true) // 允许
    } else {
      callback(false) // 拒绝
    }
  })
  if (process.env.NODE_ENV === 'development') {
    const viewUrl = `http://localhost:3000/#/cam`;
    camWin.loadURL(viewUrl);
  } else {
    const indexPath = path.join(_rootPath,'resources', 'dist', 'index.html')
    const viewUrl = `file://${indexPath}#/cam`
    camWin.loadURL(viewUrl);
  }
  setupCamIpcHandlers()
  // 可选：打开 DevTools
  // camWin.webContents.openDevTools();
  // globalShortcut.register('Control+Shift+I', () => {
  //   win.webContents.openDevTools();
  // });
}

export function closeCamWindow() {
  let camWin = windowManager.getWindow('camWin')
  if (camWin) camWin.close()
}

const camWindow = {
  createCamWindow,
  closeCamWindow
}
export default camWindow