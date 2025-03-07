// ipcHandler.js
const { ipcMain, BrowserWindow, ipcRenderer, app } = require('electron')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid')
const {query, runDb, execSql} = require('./database.js')
const ffmpeg = require('fluent-ffmpeg');
const {getWindow} = require('./createWindow.js')
const { deleteFilesInDirectory } = require('./common.js')


const rootPath = path.dirname(app.getPath('exe'));
const tempDir = path.join(rootPath, 'temp')
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

const getFilePaths = (event, fileEvent) => {
}

const processFile = async (event, fileData) => {
  const fileInfo = uploadFile(null, fileData)
  const newFilePath = path.join(tempDir, `${fileInfo.oriName}.mp4`)
  convertToMp4(fileInfo.path,newFilePath, fileInfo)
}

const uploadFile = (event, fileData) => {
  const dotIndex = fileData.name.lastIndexOf('.')
  const simpleName = fileData.name.substring(0, dotIndex);
  const extension = fileData.name.substring(dotIndex);
  const uuid = fileData.id
  const filePath = path.join(tempDir, `${uuid}${extension}`)
  fs.writeFileSync(filePath, Buffer.from(fileData.content))
  const result = {id:fileData.id, path:filePath, oriName: simpleName, relPath: path.join('temp', fileData.name), type: fileData.type}
  const win = getWindow()
  console.log('123123123');
  
  win.webContents.send('upload-success', result);
  return result
}

// 转换文件为mp4并实时返回进度
const convertToMp4 = async (inputFilePath, outputFilePath, backParams) => {
  const win = getWindow()
  ffmpeg(inputFilePath)
  .output(outputFilePath)
  .on('progress', (progress) => {
    // 获取进度信息
    const { percent } = progress;
    // 可以在这里触发渲染进程的 IPC 发送进度数据到 UI
    win.webContents.send('conversion-progress', {percent,...backParams}); // 例如，发送到渲染进程更新进度条
  })
  .on('end', () => {
    win.webContents.send('conversion-finish', {...backParams,path:outputFilePath}); // 例如，发送到渲染进程更新进度条
    console.log('转换完成！');
  })
  .on('error', (err, stdout, stderr) => {
    win.webContents.send('conversion-error', {...backParams}); // 例如，发送到渲染进程更新进度条
    console.error('发生错误:', err);
    console.error('FFmpeg 错误输出:', stderr);
  })
  .run();
}

const margeToMp4 = (event, fileData) => {
  console.log('filedata:::', fileData);
  const simpleName = fileData.name.substring(0,fileData.name.lastIndexOf('.'))
  const outputPath = path.join(tempDir, `${simpleName}.mp4`); // 输出文件路径
  const win = getWindow()

  ffmpeg()
    .input(fileData.vFilePath)
    .input(fileData.aFilePath)
    .outputOptions('-c:v copy') // 复制视频流，不重新编码
    .outputOptions('-c:a aac')  // 使用AAC编码音频流
    .outputOptions('-strict experimental') // 允许使用实验性的AAC编码器
    .save(outputPath)
    .on('end', () => {
      const resp = {id:fileData.id,aFilePath:fileData.aFilePath,vFilePath:fileData.vFilePath,path:outputPath}
      win.webContents.send('margeToMp4-finish', resp);
      console.log('音视频合并完成');
    })
    .on('error', (err) => {
      console.error('合并过程中发生错误:', err);
    });
}

const clearTempFile = () => {
  deleteFilesInDirectory( tempDir)
}

const execCode = (event, code) => {
  return eval(code)
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
  ipcMain.handle('getFilePaths',  getFilePaths)
  ipcMain.handle('processFile',  processFile)
  ipcMain.handle('clearTempFile', clearTempFile)
  ipcMain.handle('margeToMp4', margeToMp4)
  ipcMain.handle('uploadFile', uploadFile)
  ipcMain.handle('execCode', execCode)
}

module.exports = {
  setupIpcHandlers,
}
