// main/WindowManager.js
import { BrowserWindow }  from 'electron'

class WindowManager {
  constructor() {
    this.windows = new Map() // name -> window
    this.windowData = new Map() // name -> custom data
  }

  createWindow(name, options, customData = {}) {
    console.log('create', [...this.windows.keys()]);
    const win = new BrowserWindow(options)
    this.windows.set(name, win)
    this.windowData.set(name, customData)
    
    // 窗口关闭时清理
    win.on('close', () => {
      console.log('close', [...this.windows.keys()]);
      this.windows.delete(name)
      this.windowData.delete(name)
    })
    
    return win
  }

  getWindow(name) {
    console.log('get', [...this.windows.keys()]);
    if (!name) return BrowserWindow.getFocusedWindow()
    return this.windows.get(name)
  }

  getWindowData(name) {
    return this.windowData.get(name)
  }

  getAllWindowsInfo() {
    return Array.from(this.windows.entries()).map(([name, win]) => ({
      name,
      id: win.id,
      title: win.getTitle(),
      isFocused: win.isFocused(),
      isVisible: win.isVisible(),
      data: this.windowData.get(name)
    }))
  }

  findWindowByPredicate(predicate) {
    for (const [name, win] of this.windows.entries()) {
      if (predicate(name, win, this.windowData.get(name))) {
        return { name, window: win, data: this.windowData.get(name) }
      }
    }
    return null
  }
}

export const windowManager = new WindowManager()