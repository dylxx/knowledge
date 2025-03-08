/// <reference types="vite/client" />

declare global {
  interface Window {
    electron: any; // 或者更具体的类型，如：Electron.BrowserWindow
  }
}

export {};
