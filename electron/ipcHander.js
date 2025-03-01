// ipcHandler.js
const { ipcMain, BrowserWindow } = require('electron')
const {getConfig} = require('./init')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid')
const {query, runDb} = require('./database.js')

function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    console.log(size);
    win.setSize(size.width, size.height)  // 调整窗口宽度为400，高度为动态计算的值
  }
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
  newNote.createtime = getCurrentDate()
  const {title, content, createtime, uuid} = newNote
  await runDb('saveNote', toParams({title, content, createtime, uuid}))
  return newNote
}

const addNote = async (event, note) => {
  note.createtime = getCurrentDate()
  note.uuid = uuidv4()
  const {uuid, title, createtime, content} = note
  await runDb('insertNote', toParams({uuid, title, createtime, content}))
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
  group.createtime = getCurrentDate()
  const {uuid, name, createtime} = group
  runDb('insertGroup', toParams({uuid, name, createtime}))
}
const saveGroup = (event, newGroup) => {
  runDb('saveGroup', {$name:newGroup.name, $createtime:getCurrentDate(), $uuid:newGroup.uuid})
}

const groupTo = (event, params) => {
  runDb('groupTo', toParams(params))
}

const removeGroup = (event, uuid) => {
  runDb('removeNoteGroup', toParams({uuid}))
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
  ipcMain.handle('groupTo',  groupTo)
  ipcMain.handle('removeGroup',  removeGroup)
  
}

module.exports = {
  setupIpcHandlers,
}
