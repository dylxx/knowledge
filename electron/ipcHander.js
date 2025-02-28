// ipcHandler.js
const { ipcMain, BrowserWindow } = require('electron')
const {getConfig} = require('./init')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid')

function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    console.log(size);
    
    win.setSize(size.width, size.height)  // 调整窗口宽度为400，高度为动态计算的值
  }
}

function  onSearch(event, filter) {
  const config = getConfig()
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

function getGroupNote(event, groupUUID) {
  const dataList = getAllNote()
  return dataList.filter(note => note.groupUUID === groupUUID)
}

function getAllNote() {
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'data.json'); // 假设 JSON 文件路径
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');  // 读取 JSON 文件内容
  return JSON.parse(jsonData).sort((a, b) => a.createtime - b.createtime);
}

function saveNote(event, newNote) {
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'data.json');
  const dataList = getAllNote()
  console.log('note1: ', dataList);
  let note = dataList.find(item => item.uuid === newNote.uuid)
  
  note.content = newNote.content
  note.title = newNote.title
  note.group = newNote.group
  note.createtime = getCurrentDate()
  note.uuid = newNote.uuid;
  const updatedData = JSON.stringify(dataList, null, 2); // 格式化输出为 2 个空格缩进
  fs.writeFileSync(jsonFilePath, updatedData, 'utf8');
  console.log('文件已更新');
  return note
}

function addNote(event, note) {
  note.createtime = getCurrentDate()
  note.uuid = uuidv4()
  console.log('note::::: ', note);
  
  const dataList = getAllNote()
  dataList.push(note)
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'data.json');
  const updatedData = JSON.stringify(dataList, null, 2); // 格式化输出为 2 个空格缩进
  fs.writeFileSync(jsonFilePath, updatedData, 'utf8');
  return note
}


function getCurrentDate() {
  const today = new Date();

  // 获取年份、月份和日期
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');  // 月份从 0 开始，所以加 1
  const day = today.getDate().toString().padStart(2, '0');

  // 格式化日期为 'YYYY/MM/DD'
  return `${year}/${month}/${day}`;
}

function deleteNote(event, uuid) {
  let dataList = getAllNote()
  dataList = dataList.filter(item => item.uuid !== uuid)
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'data.json');
  const updatedData = JSON.stringify(dataList, null, 2); // 格式化输出为 2 个空格缩进
  fs.writeFileSync(jsonFilePath, updatedData, 'utf8');
  return note
}

function getGroupList() {
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'group.json'); // 假设 JSON 文件路径
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');  // 读取 JSON 文件内容
  return JSON.parse(jsonData).sort((a, b) => a.createtime - b.createtime);
}

function deleteGroup(event, uuid) {
  let groupList = getGroupList()
  groupList = groupList.filter(group => group.uuid !== uuid)
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'group.json');
  const updatedData = JSON.stringify(groupList, null, 2); // 格式化输出为 2 个空格缩进
  fs.writeFileSync(jsonFilePath, updatedData, 'utf8');
}

function addGroup(event, group) {
  group.uuid = uuidv4()
  group.createtime = getCurrentDate()
  let groupList = getGroupList()
  groupList.push(group)
  const config = getConfig()
  const jsonFilePath = path.join(config['filePath'], 'group.json');
  const updatedData = JSON.stringify(groupList, null, 2); // 格式化输出为 2 个空格缩进
  fs.writeFileSync(jsonFilePath, updatedData, 'utf8');
}

function saveGroup(event, newGroup) {
  let groupList = getGroupList()
  const group = groupList.find(item => item.uuid = group.uuid)
  group.name = newGroup.name
  const jsonFilePath = path.join(config['filePath'], 'group.json');
  const updatedData = JSON.stringify(groupList, null, 2); // 格式化输出为 2 个空格缩进
  fs.writeFileSync(jsonFilePath, updatedData, 'utf8');
}

function setupIpcHandlers() {
  ipcMain.handle('resize-window', resizeWindow)
  ipcMain.handle('getUngroupNote',  getUngroupNote)
  ipcMain.handle('getAllNote',  getAllNote)
  ipcMain.handle('onSearch',  onSearch)
  ipcMain.handle('saveNote',  saveNote)
  ipcMain.handle('getGroupNote',  getGroupNote)
  ipcMain.handle('addNote',  addNote)
  ipcMain.handle('deleteNote',  deleteNote)
  ipcMain.handle('getGroupList',  getGroupList)
  ipcMain.handle('deleteGroup',  deleteGroup)
  ipcMain.handle('addGroup',  addGroup)
  ipcMain.handle('saveGroup',  saveGroup)

}

module.exports = {
  setupIpcHandlers,
}
