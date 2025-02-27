// ipcHandler.js
const { ipcMain, BrowserWindow } = require('electron')
const {getConfig} = require('./init')
const fs = require('fs');
const path = require('path');

function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    console.log(size);
    
    win.setSize(size.width, size.height)  // 调整窗口宽度为400，高度为动态计算的值
  }
}

function  onSearch(event, filter) {
  const dataList = getAllNote()
  let count = 0;
  const resultList = [];
  // 计算分页的起始位置
  const startIndex = (filter.page - 1) * config.pageSize;
  
  // 遍历数组并进行模糊匹配
  for (let i = startIndex; i < dataList.length; i++) {
    const item = dataList[i];
    console.log('filter.keyword: ', filter.keyword);
    
    // 如果匹配关键字
    if (item.title.includes(filter.keyword) || item.content.includes(filter.keyword)) {
      // 如果当前页面还没达到最大数量
      
      if (count < config.pageSize) {
        resultList.push(item);
        count++;
      } else {
        break; // 如果已达到一页的数量，退出遍历
      }
    }
  }
  return {
    currentPage: filter.page,
    pageSize: config.pageSize,
    list: resultList,
    totalPages: Math.ceil(resultList.length / config.pageSize),
  };
}

function getUngroupNote() {
  const dataList = getAllNote()
  return dataList.filter(note => !note.group)
}

function getAllNote() {
  const config = getConfig()
  const jsonFilePath = config.filePath; // 假设 JSON 文件路径
      
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');  // 读取 JSON 文件内容
  return JSON.parse(jsonData);
}

function setupIpcHandlers() {
  ipcMain.handle('resize-window', resizeWindow),
  ipcMain.handle('getUngroupNote',  getUngroupNote),
  ipcMain.handle('getAllNote',  getAllNote),
  ipcMain.handle('onSearch',  onSearch)
}

module.exports = {
  setupIpcHandlers,
}
