
import { app, BrowserWindow, Menu, globalShortcut,Tray, ipcMain } from 'electron'
import path from 'path'
import { __dirname } from './common.js'
let tray
let isHidden = false;
let win
const createWindow = () => {
  win = new BrowserWindow({
    width: 361,
    height: 96,
    icon: path.join(__dirname, '../public/no.ico'),
    // alwaysOnTop: true,  // 确保窗口始终在最前面
    frame: false,
    backgroundColor: '#0000000',
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: true
    }
  })
  Menu.setApplicationMenu(null)

  // Menu.setApplicationMenu(null); // 取消默认菜单

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')  // 假设 Vite 服务器运行在 3000 端口
  } else {
    win.loadFile('./dist/index.html')
    // win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
  
  tray = new Tray(path.join(__dirname, '../public/no.ico'),);
  tray.setToolTip('note');

  // 设置托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        win.show();
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
    if (isHidden) {
      win.show();
      isHidden = false;
    } else {
      win.hide();
      isHidden = true;
    }
  });
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

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
function getWindow() {
  return win
}

export {createWindow, getWindow}