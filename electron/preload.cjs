
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
  onConversionError: (callback) => ipcRenderer.on('conversion-error', (_event, value) =>  callback(value)),
  onUpSuccess: (callback) => ipcRenderer.on('onUpSuccess', (_event, value) =>  callback(value)),
  resizeWindow: (size, name) => ipcRenderer.invoke('resize-window', size, name),
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
  processFile: (fileData, transFormat) => ipcRenderer.invoke('processFile', fileData, transFormat),
  uploadFile: (fileData, dirType) => ipcRenderer.invoke('uploadFile', fileData, dirType),
  clearTempFile: () => ipcRenderer.invoke('clearTempFile'),
  margeToMp4: (fileData) => ipcRenderer.invoke('margeToMp4', fileData),
  execCode: (code) => ipcRenderer.invoke('execCode', code),
  getMusicDirList: (dirPath) => {
    return ipcRenderer.invoke('getMusicDirList', dirPath)
  },
  readFile: (path) => ipcRenderer.invoke('readFile', path),
  copyFileToTemp: (params) => ipcRenderer.invoke('copyFileToTemp', params),
  runSql: (params) => ipcRenderer.invoke('runSql', params),
  updateConfig: (params) => ipcRenderer.invoke('updateConfig', params),
  savePwd: (params) => ipcRenderer.invoke('savePwd', params),
  addPwd: (params) => ipcRenderer.invoke('addPwd', params),
  delPwd: (params) => ipcRenderer.invoke('delPwd', params),
  getPwdList: (params) => ipcRenderer.invoke('getPwdList', params),
  toRecord: (params) => ipcRenderer.invoke('toRecord',params),
  getAudioDevices: () => ipcRenderer.invoke('getAudioDevices'),
  createShotWindow: (params) => ipcRenderer.invoke('createShotWindow', params),
  copyFile: (params) => ipcRenderer.invoke('copyFile', params),
  delFile: (params) => ipcRenderer.invoke('delFile', params),
  camWindowHandle: (params) => ipcRenderer.invoke('camWindowHandle', params),
  savePersonRel: (params) => ipcRenderer.invoke('savePersonRel', params),
  deletePersonRel: (uuid) => ipcRenderer.invoke('deletePersonRel',uuid),
  saveClipboardToTxt: (params) => ipcRenderer.invoke('saveClipboardToTxt', params),
  saveClipboardImageToFile: () => ipcRenderer.invoke('saveClipboardImageToFile'),
  setClipboard: (text) => ipcRenderer.invoke('setClipboard', text),
  hideWin: (winName) => ipcRenderer.invoke('hideWin', winName)
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

