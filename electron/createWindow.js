
import { app, BrowserWindow, Menu, globalShortcut,Tray, screen } from 'electron'
import path from 'path'
import utils,{ __dirname, _rootPath, _assetsDir } from './common.js'
import fs from 'fs'
import { windowManager } from "./windowManager.js";
let tray
let isHidden = false;
let win
const createWindow = (reboot) => {
  const {x,y} = getWindowBounds()
  console.log(path.join(_rootPath,'resources', 'dist', 'no.ico'));
  const options = {
    x,
    y,
    width: 361,
    height: 96,
    icon: path.join(_assetsDir, 'no.ico'),
    alwaysOnTop: true,  // 确保窗口始终在最前面
    frame: false,
    backgroundColor: '#0000000',
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      permissions: ['clipboard-write', 'clipboard-read'],
      devTools: true
    }
  }
  win = windowManager.createWindow('mainWin', options)
  Menu.setApplicationMenu(null)
  win.webContents.setBackgroundThrottling(false)
  // Menu.setApplicationMenu(null); // 取消默认菜单
  
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')  // 假设 Vite 服务器运行在 3000 端口
  } else {
    win.loadFile('./dist/index.html')
    // win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
  
  // 首次创建窗口时创建小图标
  if (!reboot) {
    setTrayAndMenu()
  }

  // win.setSkipTaskbar(true) // 隐藏任务栏图标
  globalShortcut.register('Control+Shift+I', () => {
    win.webContents.openDevTools();
  });
  globalShortcut.register('Alt+c', () => {
    if (isHidden) {
      win.show();
      isHidden = false;
    } else {
      win.hide();
      isHidden = true;
    }
  });
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  })

  win.once('ready-to-show', () => {
    win.show();
  });
  app.on("ready", async () => {
    try {
      await session.defaultSession.clearCache();
      console.log("缓存已清理");
    } catch (error) {
      console.error("清理缓存失败:", error);
    }
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  function getWindowBounds() {
    try {
      const {config} = utils.getConfig()
      const bounds = {x:config.now.placeX, y:config.now.placeY,width:config.now.width,height:config.now.height}
      const display = screen.getPrimaryDisplay();
      const { width, height } = display.workAreaSize;
      bounds.x = Math.max(0, Math.min(bounds.x, width - bounds.width));
      bounds.y = Math.max(0, Math.min(bounds.y, height - bounds.height));
      return bounds
    } catch (err) {
      console.error(err);
      return { x: 800, y: 600 }; // 默认窗口大小
    }
  }
  function saveWindowBounds() {
    if (win) {
      const bounds = win.getBounds();
      const {config, configPath} = utils.getConfig();
      config.now.placeX = bounds.x
      config.now.placeY = bounds.y
      config.now.width = bounds.width
      config.now.height = bounds.height
      fs.writeFileSync(configPath, JSON.stringify(config));
    }
  }
  // 记录窗口关闭的位置
  win.on('close', saveWindowBounds)
}

function setTrayAndMenu() {
  tray = new Tray(path.join(_assetsDir, 'no.ico'));
  tray.setToolTip('note');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        win = windowManager.getWindow('mainWin')
        if (win) {
          win.show()
          isHidden = false;
        } else {
          win = createWindow(true)
        }
        isHidden = false;
      }
    },
    {
      label: '退出',
      click: () => {
        app.quit(); // 退出应用
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
  // 监听双击托盘图标，显示/隐藏窗口
  tray.on('double-click', () => {
    win = windowManager.getWindow('mainWin')
    if (!win) {
      win = createWindow(true)
    } else if (isHidden) {
      win.show();
      isHidden = false;
    } else {
      win.hide();
      isHidden = true;
    }
  });
}

export {createWindow}