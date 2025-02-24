
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const createWindow = () => {
    let win = new BrowserWindow({
        width: 300,
        height: 300,
        // alwaysOnTop: true,  // 确保窗口始终在最前面
        backgroundColor: '#0000000',
        skipTaskbar: false,
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            // contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    Menu.setApplicationMenu(null); // 取消默认菜单

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000')  // 假设 Vite 服务器运行在 3000 端口
    } else {
        win.loadFile('./dist/index.html')
        // win.loadFile(path.join(__dirname, 'dist', 'index.html'))
    }
    // win.setSkipTaskbar(true) // 隐藏任务栏图标
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
    // win.loadURL('http://localhost:3000')
}


app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})