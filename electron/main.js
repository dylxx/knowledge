
const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron')
const {setupIpcHandlers} = require('./ipcHander')
const {init} = require('./init')
const path = require('path')
const createWindow = () => {
  let win = new BrowserWindow({
    width: 320,
    height: 96,
    // alwaysOnTop: true,  // 确保窗口始终在最前面
    frame: false,
    backgroundColor: '#0000000',
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })
  // 自定义菜单

  Menu.setApplicationMenu(null); // 取消默认菜单

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')  // 假设 Vite 服务器运行在 3000 端口
  } else {
    win.loadFile('./dist/index.html')
    // win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
  // win.setSkipTaskbar(true) // 隐藏任务栏图标
  globalShortcut.register('Control+Shift+I', () => {
    win.webContents.openDevTools();
  });
  // win.webContents.openDevTools()
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
  // win.loadURL('http://localhost:3000')
}

// 处理文件转码
ipcMain.on('start-conversion', (event, filePath) => {
  
  console.log('filePath:', filePath);
  
  const outputDir = path.dirname(filePath); // 获取文件所在目录
  const outputFileName = path.basename(filePath, path.extname(filePath)) + '-converted.mp4';
  const outputFile = join(outputDir, outputFileName);

  // 使用 FFmpeg 转码文件
  ffmpeg(filePath)
    .output(outputFile)
    .on('end', () => {
      console.log('转码完成');
      // 发送转码后的文件路径给渲染进程
      event.reply('conversion-complete', `file://${outputFile}`);
    })
    .on('error', (err) => {
      console.error('转码失败:', err);
      event.reply('conversion-complete', '转码失败');
    })
    .run();
});

// 接收预加载脚本发送的路径，再转发到渲染进程
ipcMain.on('ondrop', (event, paths) => {
  console.log('paths', paths);
  
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send('ondrop-reply', paths);
  }
});


app.whenReady().then(() => {
  createWindow()
  setupIpcHandlers()
  init()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})