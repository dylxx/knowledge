
const { contextBridge, ipcRenderer } = require('electron');


// 方法


// 暴露的方法
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  off: (channel, listener) => ipcRenderer.removeListener(channel, listener),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  createShotWindow: (params) => ipcRenderer.invoke('createShotWindow', params)
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

