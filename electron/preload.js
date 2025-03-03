
const { contextBridge, ipcRenderer } = require('electron');

// 暴露的方法
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  resizeWindow: (size) => ipcRenderer.invoke('resize-window', size),
  getWindowSize: () => ipcRenderer.invoke('getWindowSize'),
  onSearch: (filter) => ipcRenderer.invoke('onSearch', filter),
  getUngroupNote: () => ipcRenderer.invoke('getUngroupNote'),
  getAllNote: () => ipcRenderer.invoke('getAllNote'),
  saveNote: (note) => ipcRenderer.invoke('saveNote', note),
  getGroupNote: (groupUUID) => ipcRenderer.invoke('getGroupNote', groupUUID),
  addNote: (note) => ipcRenderer.invoke('addNote', note),
  deleteNote: (uuid) => ipcRenderer.invoke('deleteNote', uuid),
  getGroupList: () => ipcRenderer.invoke('getGroupList'),
  deleteGroup: (uuid) => ipcRenderer.invoke('deleteGroup', uuid),
  addGroup: (group) => ipcRenderer.invoke('addGroup', group),
  saveGroup: (group) => ipcRenderer.invoke('saveGroup',group),
  groupTo: (params) => ipcRenderer.invoke('groupTo',params),
  removeGroup: (uuid) => ipcRenderer.invoke('removeGroup',uuid),
  search: (params) => ipcRenderer.invoke('search',params),
  mainSearch: (keywords) => ipcRenderer.invoke('mainSearch',keywords),
  getConfig:() => ipcRenderer.invoke('getConfig'),
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

