
const { contextBridge, ipcRenderer } = require('electron');

// 暴露的方法
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  resizeWindow: (size) => ipcRenderer.invoke('resize-window', size),
  onSearch: (filter) => ipcRenderer.invoke('onSearch', filter),
  getUngroupNote: (filter) => ipcRenderer.invoke('getUngroupNote', filter),
  getAllNote: (filter) => ipcRenderer.invoke('getAllNote', filter),
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

