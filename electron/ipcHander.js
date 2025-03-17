// ipcHandler.js
import { ipcMain, BrowserWindow, app } from 'electron'
// 这样改回 require 方式

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import {query, runDb, execSql} from './database.js'
import ffmpeg from 'fluent-ffmpeg'
import {getWindow} from './createWindow.js'
import utils,{deleteFilesInDirectory, __dirname,getConfig, updateConfig } from './common.js'
import mime from 'mime-types'
import {parseFile} from 'music-metadata'

const rootPath = path.dirname(app.getPath('exe'));
const tempDir = process.env.NODE_ENV==='development'? path.join(__dirname, 'temp'): path.join(rootPath, 'temp')
const userDataDir = process.env.NODE_ENV==='development'? path.join(__dirname, 'userData'): path.join(rootPath, 'userData')
const keyMap = {
  password: process.env.PWD_KEY
}
function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    const rsize = win.getSize()
    console.log([size[0]||rsize[0], size[1]||rsize[1]]);
    win.setSize(size[0]||rsize[0], size[1]||rsize[1], true)  
  }
}

const onSearch = async (event, filter) => {
  const {config} = getConfig()
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
  // decrypt: ['password', 'password']
  let list =  await query(params.name, toParams(params.params))
  // 解密处理
  if(params.decrypt) {
    list = list.map(item => {
      params.decrypt.map(item2 => {
        console.log(11111111111, keyMap);
        
        item[item2[0]] = utils.decrypt(item[item2[0]], keyMap[item2[1]])
      })
      return item
    })
  }
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

const mainSearchPwd = async (event, keywords) => {
  const conditions = keywords.map(() => `name || ' ' || username LIKE ?`).join(' AND ');
  const sql = `SELECT * FROM userpwd WHERE ${conditions}`;
  const params = keywords.map(keyword => `%${keyword}%`);
  return await execSql(sql, params)
}

const getConf = (event, params) => {
  const {config} =  getConfig()
  return config.now[params]
}

const getFilePaths = (event, fileEvent) => {
}

const processFile = async (event, fileData) => {
  const fileInfo = uploadFile(null, fileData, 'temp')
  const newFilePath = path.join(tempDir, `${fileInfo.oriName}.mp4`)
  convertToMp4(fileInfo.path,newFilePath, fileInfo)
}

const uploadFile = (event, fileData, dirType) => {
  const dir = ({'temp': tempDir, 'userData': userDataDir})[dirType]
  const dotIndex = fileData.name.lastIndexOf('.')
  const simpleName = fileData.name.substring(0, dotIndex);
  const extension = fileData.name.substring(dotIndex);
  const uuid = fileData.id || uuidv4()
  // 确定固定名字
  const filePath = fileData.fixName ? path.join(dir, `${fileData.fixName}${extension}`) : path.join(dir, `${uuid}${extension}`)
  const relPath = `../${dirType}/${uuid}${extension}`
  fs.writeFileSync(filePath, Buffer.from(fileData.content))
  const result = {id:fileData.id, path:filePath,relPath, oriName: simpleName, type: fileData.type}
  const win = getWindow()
  console.log('123123123');
  win.webContents.send('onUpSuccess', result);
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
    win.webContents.send('onConversionProgress', {percent,...backParams}); // 例如，发送到渲染进程更新进度条
  })
  .on('end', () => {
    win.webContents.send('onConversionFinish', {...backParams,path:outputFilePath}); // 例如，发送到渲染进程更新进度条
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
      win.webContents.send('margeToMp4Finish', resp);
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

const getMusicDirListTraverse = async (event, dirPath, musicDirList, indexs) => {
  // 初始化树结构
  const tree = {
    id: uuidv4(),
    name: path.basename(dirPath),
    path: dirPath,
    type: 'directory',
    children: []
  };
  const files = fs.readdirSync(dirPath);
  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // 如果是目录，递归获取子目录的音频文件树
      tree.children.push( await getMusicDirListTraverse(event, filePath, musicDirList, [...indexs, index]));
    } else if (stats.isFile() && isAudioFile(file)) {
      const id = uuidv4()
      // 如果是音频文件，添加到当前目录的子节点中
      musicDirList.push({id,filePath, indexs: [...indexs, index]})
      // const metadata = await parseFile(filePath)
      tree.children.push({
        id: id,
        name: file,
        path: filePath,
        type: 'file',
        fileType: mime.lookup(filePath),
        duration: 3
      });
    }
  };
  return JSON.parse(JSON.stringify(tree));
}

const getMusicDirList = async (event, path) => {
  // 赋值用地址
  const musicDirList = []
  const tree = await getMusicDirListTraverse(event, path, musicDirList, [])
  // console.log(musicDirList);
  const promises = musicDirList.map((item, index) => getDuration(item, index));
  const results = await Promise.all(promises)
  modifyTree(tree, results)
  return tree
}

const modifyTree = (node, params) => {
  const item = params.find(item => item.id === node.id)
  if(item) {
    node.duration = item.duration
  }
  // 递归处理子节点
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => modifyTree(child,params));
  }
};

async function getDuration(item, index) {
  return new Promise(async (resolve) => {
    const metadata = await parseFile(item.filePath)
    resolve({id: item.id, duration:Number(metadata.format.duration.toFixed(1))})
  });
}

function isAudioFile(filename) {
  // 定义音频文件的扩展名
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg'];
  const ext = path.extname(filename).toLowerCase();
  return audioExtensions.includes(ext);
}

const readMusic = async (evnet, path) => {
  try {
    const result = await fs.promises.readFile(path)
    return result
  } catch (error) {
    return null
  }
}

const copyFileToTemp = async (event, params) => {
  const extension = params.path.substring(params.path.lastIndexOf('.')) 
  newPath = path.join(tempDir, params.id+extension)
  // 不存在才复制文件
  if (!fs.existsSync(newPath)) {
    fs.copyFileSync(params.path, newPath)
  }
  return newPath
}

const savePwd = async (event, params) => {
  params.createtime = getCurrentTime()
  params.password = utils.encrypt(params.password, process.env.PWD_KEY)
  return await runDb('savePwd', toParams(params))
}
const addPwd = async (event, params) => {
  params.uuid = uuidv4()
  params.createtime = getCurrentTime()
  const pwd = {...params}
  params.password = utils.encrypt(params.password, process.env.PWD_KEY)
  await runDb('addPwd', toParams(params))
  return pwd
}

const runSql = async (event, params) => {
  return await runDb(params.name, toParams(params.params) )
}

const updateConf = (event, params) => {
  
  const {config} = getConfig()
  console.log(1111, config);
  // config.now.tomatoMusic = 'E:\\project\\knowledge\\electron\\userData\\3660d75c-120b-4d28-976f-2f4346a14e89.mp3'
  config.now[params.name] = params.value
  updateConfig(config)
}

const delPwd = async (event, params) => {
  await runDb('delPwd', toParams(params))
}

const getPwdList = async (evnet, params) => {
  const list =  await query('getPasswordList')
  // return list
  return list.map(item => {
    item.password = utils.decrypt(item.password, process.env.PWD_KEY)
    return item
  })
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
  ipcMain.handle('search',  search)
  ipcMain.handle('mainSearch',  mainSearch)
  ipcMain.handle('mainSearchPwd',  mainSearchPwd)
  ipcMain.handle('getConf',  getConf)
  ipcMain.handle('getFilePaths',  getFilePaths)
  ipcMain.handle('processFile',  processFile)
  ipcMain.handle('clearTempFile', clearTempFile)
  ipcMain.handle('margeToMp4', margeToMp4)
  ipcMain.handle('uploadFile', uploadFile)
  ipcMain.handle('execCode', execCode)
  ipcMain.handle('getMusicDirList', getMusicDirList)
  ipcMain.handle('readMusic', readMusic)
  ipcMain.handle('copyFileToTemp',copyFileToTemp)
  ipcMain.handle('runSql',runSql)
  ipcMain.handle('updateConfig',updateConf)
  ipcMain.handle('savePwd',savePwd)
  ipcMain.handle('addPwd',addPwd)
  ipcMain.handle('delPwd', delPwd)
  ipcMain.handle('getPwdList', getPwdList)
}

export {setupIpcHandlers}
