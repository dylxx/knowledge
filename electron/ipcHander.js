// ipcHandler.js
const { ipcMain, BrowserWindow, ipcRenderer } = require('electron')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid')
const {query, runDb, execSql} = require('./database.js')

function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    console.log(size);
    win.setSize(size.width, size.height)  // 调整窗口宽度为400，高度为动态计算的值
  }
}

function getWindowSize() {
  const win = BrowserWindow.getFocusedWindow()
  return win.getSize()
}

const onSearch = async (event, filter) => {
  const config = getConfig()
  const total =  await query('getNoteTotal', {})
  const startIndex = (filter.page - 1) * config.pageSize;
  const resultList =  await query('getNotePage', {$pagesize:config.pageSize,$offset: startIndex})

  return {
    currentPage: filter.page,
    pageSize: config.pageSize,
    list: resultList,
    totalPages: Math.ceil(resultList.length / config.pageSize),
  };
}

const getUngroupNote = async (event) => {
  return await query('getNoteUnGroup', {})
}

const getGroupNote = async (event, groupuuid) => {
  return await query('getNoteByGroupId', toParams({groupuuid}))
}

const getAllNote = async (event) => {
  return await query('getAllNote', {})
}

const saveNote = async (event, newNote) => {
  newNote.createtime = getCurrentTime()
  const {title, content, createtime, uuid} = newNote
  await runDb('saveNote', toParams({title, content, createtime, uuid}))
  return newNote
}

const addNote = async (event, note) => {
  note.createtime = getCurrentTime()
  note.uuid = uuidv4()
  const {uuid, title, createtime, content} = note
  await runDb('insertNote', toParams({uuid, title, createtime, content}))
  return note
}

function getCurrentTime() {
  const now = new Date();

  // 获取年、月、日、时、分、秒
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // 拼接成目标格式
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

console.log(getCurrentTime());
// 输出: '2023-10-05 14:30:45'（根据当前时间）

const deleteNote = async (event, uuid) => {
  await runDb('deleteNoteByUUID', toParams({uuid}))
}

const getGroupList = async () => {
  return await query('getAllGroup', {})
}

const deleteGroup = (event, uuid) => {
  runDb('deleteGroupByUUID', toParams({uuid}))
  runDb('removeGroup', {$groupuuid:uuid})
}

const addGroup = (event, group) => {
  group.uuid = uuidv4()
  group.createtime = getCurrentTime()
  const {uuid, name, createtime} = group
  runDb('insertGroup', toParams({uuid, name, createtime}))
}
const saveGroup = (event, newGroup) => {
  runDb('saveGroup', {$name:newGroup.name, $createtime:getCurrentTime(), $uuid:newGroup.uuid})
}

const groupTo = (event, params) => {
  runDb('groupTo', toParams(params))
}

const removeGroup = (event, uuid) => {
  runDb('removeNoteGroup', toParams({uuid}))
}

const search = async (evnet, params) => {
  const list =  await query(params.name, toParams(params.params))
  console.log('list:::--', list);
  return list
}

function toParams(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) { // 确保只处理对象自身的属性
      const newKey = `$${key}`; // 新属性名，加上 $ 符号
      obj[newKey] = obj[key]; // 将值赋给新属性名
      delete obj[key]; // 删除原始属性
    }
  }
  return obj; // 返回修改后的对象
}

const mainSearch = async (event, keywords) => {
  const conditions = keywords.map(() => `title || ' ' || content LIKE ?`).join(' AND ');
  const sql = `SELECT * FROM notes WHERE ${conditions}`;
  const params = keywords.map(keyword => `%${keyword}%`);
  return await execSql(sql, params)
}

const getConfig = () => {
  // 读取 JSON 文件
  const jsonFilePath = './electron/config.json'; // 假设 JSON 文件路径
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');  // 读取 JSON 文件内容
  // 解析 JSON 数据
  return data = JSON.parse(jsonData);
}

function setupIpcHandlers() {
  ipcMain.handle('getWindowSize', getWindowSize)
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
  ipcMain.handle('groupTo',  groupTo)
  ipcMain.handle('removeGroup',  removeGroup)
  ipcMain.handle('search',  search)
  ipcMain.handle('mainSearch',  mainSearch)
  ipcMain.handle('getConfig',  getConfig)
  
}

module.exports = {
  setupIpcHandlers,
}
