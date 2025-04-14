import { BrowserWindow, desktopCapturer, screen,globalShortcut } from 'electron';
import * as path from 'path';
import {setupScreenshotIpcHandlers} from './screenshotHander.js'
import utils,{ __dirname, _rootPath, _assetsDir,_tempDir } from './common.js'
import screenshot from "screenshot-desktop";
import fs from 'fs'
import { windowManager } from "./windowManager.js";
let screenshotWin= null;

export async function createScreenshotWindow() {
  // 如果已有窗口，先关闭
  if (screenshotWin) {
    screenshotWin.close();
    screenshotWin = null;
  }

    // 获取主屏尺寸
  const { width, height } = screen.getPrimaryDisplay().bounds;
  const {img, filePath} = await captureFullScreen()
  // 创建窗口
  const options = {
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      permissions: ['clipboard-write', 'clipboard-read'],
      preload: path.join(__dirname, 'screenshotProload.cjs'), // 如需要
    },
  }
  screenshotWin = windowManager.createWindow('screenshotWin', options)
  // 传截图地址作为查询参数传入页面
  if (process.env.NODE_ENV === 'development') {
    const viewUrl = `http://localhost:3000/#/screenshot`;
    screenshotWin.loadURL(viewUrl);
  } else {
    const indexPath = path.join(_rootPath,'resources', 'dist', 'index.html')
    const viewUrl = `file://${indexPath}#/screenshot`
    screenshotWin.loadURL(viewUrl);
  }
  setupScreenshotIpcHandlers()
  // 可选：打开 DevTools
  // screenshotWin.webContents.openDevTools();
  // globalShortcut.register('Control+Shift+I', () => {
  //   win.webContents.openDevTools();
  // });
}

const captureFullScreen = async () => {
  try {
    // 获取所有显示器的截图
    const displays = await screenshot.listDisplays();
    // 捕获主显示器
    const img = await screenshot({ 
      screen: displays[0].id,
      format: 'png',
      // 可以指定质量 (仅对 jpg 有效)
      // quality: 100 
    });
    // img 是 Buffer，可以直接保存
    const filePath = path.join(_tempDir, 'screenshot.png')
    fs.writeFileSync(filePath, img);
    return {filePath, img};
  } catch (error) {
    console.error('截图失败:', error);
  }
}

export function closeScreenshotWindow() {
  console.log(1111, '关闭窗口');
  
  if (screenshotWin) {
    screenshotWin.close();
    screenshotWin = null;
  }
}

const screenshotWindow = {
  createScreenshotWindow,
  closeScreenshotWindow
}
export default screenshotWindow