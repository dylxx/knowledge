
const { contextBridge, ipcRenderer } = require('electron');
// 暴露的方法
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  off: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  listenerCount: (channel) => {
    ipcRenderer.listenerCount(channel);
  },
  startDrag: (fileName) => ipcRenderer.send('ondragstart', fileName),
  receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  onConversionProgress: (callback) => ipcRenderer.on('onConversionProgress', (_event, value) =>  callback(value)),
  onConversionFinish: (callback) => ipcRenderer.on('onConversionFinish', (_event, value) =>  callback(value)),
  margeToMp4Finish: (callback) => ipcRenderer.on('margeToMp4Finish', (_event, value) =>  callback(value)),
  // onConversionError: (channel,callback) => ipcRenderer.on('conversion-error', callback),
  onUpSuccess: (callback) => ipcRenderer.on('onUpSuccess', (_event, value) =>  callback(value)),
  resizeWindow: (size) => ipcRenderer.invoke('resize-window', size),
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
  mainSearchPwd: (keywords) => ipcRenderer.invoke('mainSearchPwd',keywords),
  getConf:(params) => ipcRenderer.invoke('getConf', params),
  getFilePaths:(files) => ipcRenderer.invoke('getFilePaths', files),
  processFile: (fileData) => ipcRenderer.invoke('processFile', fileData),
  uploadFile: (fileData, dirType) => ipcRenderer.invoke('uploadFile', fileData, dirType),
  clearTempFile: () => ipcRenderer.invoke('clearTempFile'),
  margeToMp4: (fileData) => ipcRenderer.invoke('margeToMp4', fileData),
  execCode: (code) => ipcRenderer.invoke('execCode', code),
  getMusicDirList: (dirPath) => {
    return ipcRenderer.invoke('getMusicDirList', dirPath)
  },
  readMusic: (path) => ipcRenderer.invoke('readMusic', path),
  copyFileToTemp: (params) => ipcRenderer.invoke('copyFileToTemp', params),
  runSql: (params) => ipcRenderer.invoke('runSql', params),
  updateConfig: (params) => ipcRenderer.invoke('updateConfig', params),
  savePwd: (params) => ipcRenderer.invoke('savePwd', params),
  addPwd: (params) => ipcRenderer.invoke('addPwd', params),
  delPwd: (params) => ipcRenderer.invoke('delPwd', params),
  getPwdList: (params) => ipcRenderer.invoke('getPwdList', params),
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

