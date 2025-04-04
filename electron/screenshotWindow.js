import { BrowserWindow, desktopCapturer, screen,globalShortcut } from 'electron';
import * as path from 'path';
import {setupScreenshotIpcHandlers} from './screenshotHander.js'
import utils,{ __dirname, _rootPath, _assetsDir } from './common.js'

let screenshotWin= null;

export async function createScreenshotWindow() {
  // 如果已有窗口，先关闭
  if (screenshotWin) {
    screenshotWin.close();
    screenshotWin = null;
  }

  // 获取主屏尺寸
  const { width, height } = screen.getPrimaryDisplay().bounds;

  // 获取桌面截图
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height },
  });
  // sources中包括所有显示屏的屏幕
  const screenSource = sources[0];
  if (!screenSource) {
    throw new Error('无法获取屏幕截图');
  }

  const imageUrl = screenSource.thumbnail.toDataURL(); // 截图转为 base64

  // 创建窗口
  screenshotWin = new BrowserWindow({
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
      preload: path.join(__dirname, 'screenshotProload.cjs'), // 如需要
    },
  });

  // 传截图地址作为查询参数传入页面
  if (process.env.NODE_ENV === 'development') {
    const viewUrl = `http://localhost:3000/#/screenshot?image=${encodeURIComponent(imageUrl)}`;
    screenshotWin.loadURL(viewUrl);
  } else {
    screenshotWin.loadFile('./dist/index.html')
    // win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
  setupScreenshotIpcHandlers()
  // 可选：打开 DevTools
  // screenshotWin.webContents.openDevTools();
  // globalShortcut.register('Control+Shift+I', () => {
  //   win.webContents.openDevTools();
  // });
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