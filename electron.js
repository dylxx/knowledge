const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 100,  // 设置悬浮球的宽度
    height: 100,  // 设置悬浮球的高度
    frame: false,  // 去掉窗口的边框
    transparent: true,  // 设置透明背景
    alwaysOnTop: true,  // 确保窗口始终在最前面
    resizable: false,  // 禁止调整大小
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 加载 Vue 开发服务器或打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080'); // Vue 开发服务器地址
    mainWindow.webContents.openDevTools(); // 打开开发者工具
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html')); // 加载打包后的文件
  }
}

// 应用准备就绪后创建窗口
app.whenReady().then(createWindow);

// 关闭所有窗口时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS 点击 Dock 图标时重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});