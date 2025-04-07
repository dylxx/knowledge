// ipcHandler.js
import { ipcMain, BrowserWindow, app,desktopCapturer,screen,Menu } from 'electron'
// 这样改回 require 方式
let screenshotWin = null;

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import {query, runDb, execSql} from './database.js'
import ffmpeg from 'fluent-ffmpeg'
import utils,{__dirname, _rootPath, _tempDir, _userDataDir,_out } from './common.js'
import mime from 'mime-types'
import {parseFile} from 'music-metadata'
import { createRequire } from "module";
import screenshotWindow from "./screenshotWindow.js";
import camWindow from "./camWindow.js";
import rightMenu from "./rightMenu.js";
import { windowManager } from "./windowManager.js";
const require = createRequire(import.meta.url)
const { spawn } = require('child_process')
// const screenshot = require('screenshot-desktop');
// const getPixels = require('get-pixels');
const keyMap = {
  password: process.env.PWD_KEY
}
function resizeWindow(event, size) {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    const rsize = win.getSize()
    console.log('重置窗口尺寸: ',size);
    win.setSize(size[0]||rsize[0], size[1]||rsize[1], true)
  }
}

const onSearch = async (event, filter) => {
  const {config} = utils.getConfig()
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
  newNote.createtime = utils.getCurrentTime()
  const {title, content, createtime, uuid} = newNote
  await runDb('saveNote', toParams({title, content, createtime, uuid}))
  return newNote
}

const addNote = async (event, note) => {
  note.createtime = utils.getCurrentTime()
  note.uuid = uuidv4()
  const {uuid, title, createtime, content} = note
  await runDb('insertNote', toParams({uuid, title, createtime, content}))
  return note
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
  group.createtime = utils.getCurrentTime()
  const {uuid, name, createtime} = group
  runDb('insertGroup', toParams({uuid, name, createtime}))
}
const saveGroup = (event, newGroup) => {
  runDb('saveGroup', {$name:newGroup.name, $createtime:utils.getCurrentTime(), $uuid:newGroup.uuid})
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
        
        item[item2[0]] = utils.decrypt(item[item2[0]], keyMap[item2[1]])
      })
      return item
    })
  }
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
  const {config} =  utils.getConfig()
  return config.now[params]
}

const getFilePaths = (event, fileEvent) => {
}

const processFile = async (event, fileData, transFormat) => {
  console.log(1111, fileData);
  const fileInfo = uploadFile(null, fileData, 'temp')
  const sampleName = fileData.name.substring(0, fileData.name.lastIndexOf('.'))
  fileInfo.newFileName = `${sampleName}.${transFormat}`
  convertMedia(fileInfo.fullName, sampleName, transFormat, fileInfo)
}

const uploadFile = (event, fileData, dirType) => {
  const uuid = fileData.id || uuidv4()
  const name = fileData.fixName ? fileData.fixName : uuid
  const dir = ({'temp': _tempDir, 'userData': _userDataDir, 'out':_out})[dirType]
  const extension = fileData.name.substring(fileData.name.lastIndexOf('.'));
  // 确定固定名字
  const fullName = `${name}${extension}`
  const filePath = path.join(dir, fullName)
  fs.writeFileSync(filePath, Buffer.from(fileData.content))
  const result = {id: fileData.id, name, extension, path: filePath, fullName}
  const win = windowManager.getWindow('mainWin')
  win.webContents.send('onUpSuccess', result);
  return result
}

// 转换文件为mp4并实时返回进度
const convertToMp4 = async (inputFilePath, outputFilePath, backParams) => {
  const win = windowManager.getWindow('mainWin')
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
  })
  .on('error', (err, stdout, stderr) => {
    win.webContents.send('conversion-error', {...backParams}); // 例如，发送到渲染进程更新进度条
    console.error('发生错误:', err);
    console.error('FFmpeg 错误输出:', stderr);
  })
  .run();
}

/**
 * 
 * @param {*} inFilename 临时文件文件名(包含后缀)
 * @param {*} outFilename 输出临时文件名(不包含后缀)
 * @param {*} format 格式
 * @param {*} backParams 通知附带参数
 */
const convertMedia = async (inFilename, outFilename,format, backParams) => {
  const inputFilePath = path.join(_tempDir, inFilename)
  const outputFilePath = path.join(_out, outFilename) + `.${format}`
  const win = windowManager.getWindow('mainWin')
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
  })
  .on('error', (err, stdout, stderr) => {
    win.webContents.send('conversion-error', {...backParams}); // 例如，发送到渲染进程更新进度条
    console.error('发生错误:', err);
    console.error('FFmpeg 错误输出:', stderr);
  })
  .run();
}

const margeToMp4 = (event, fileData) => {
  const simpleName = fileData.name.substring(0,fileData.name.lastIndexOf('.'))
  const outputPath = path.join(_out, `${simpleName}.mp4`); // 输出文件路径
  const win = windowManager.getWindow('mainWin')

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
    })
    .on('error', (err) => {
      console.error('合并过程中发生错误:', err);
    });
}

const clearTempFile = () => {
  utils.deleteFilesInDirectory( _tempDir)
  utils.deleteFilesInDirectory( _out)
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

const readFile = async (evnet, path) => {
  try {
    const result = await fs.promises.readFile(path)
    return result
  } catch (error) {
    console.error(error);
    return null
  }
}

const getShotPhoto = async ($event, params) => {
  const filePath = params && params.filePath || path.join(_tempDir, 'screenshot.png')
  console.log(111, filePath);
  return await readFile(null, filePath)
}

const copyFileToTemp = async (event, params) => {
  const extension = params.path.substring(params.path.lastIndexOf('.')) 
  newPath = path.join(_tempDir, params.id+extension)
  // 不存在才复制文件
  if (!fs.existsSync(newPath)) {
    fs.copyFileSync(params.path, newPath)
  }
  return newPath
}

const savePwd = async (event, params) => {
  params.createtime = utils.getCurrentTime()
  params.password = utils.encrypt(params.password, process.env.PWD_KEY)
  return await runDb('savePwd', toParams(params))
}
const addPwd = async (event, params) => {
  params.uuid = uuidv4()
  params.createtime = utils.getCurrentTime()
  const pwd = {...params}
  params.password = utils.encrypt(params.password, process.env.PWD_KEY)
  await runDb('addPwd', toParams(params))
  return pwd
}

const runSql = async (event, params) => {
  return await runDb(params.name, toParams(params.params) )
}

const updateConf = (event, params) => {
  
  const {config} = utils.getConfig()
  // config.now.tomatoMusic = 'E:\\project\\knowledge\\electron\\userData\\3660d75c-120b-4d28-976f-2f4346a14e89.mp3'
  config.now[params.name] = params.value
  utils.updateConfig(config)
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

let recordingProcess = null;
let autoStopRecordTimer = null;
const toRecord = async (event, params) => {
  // return
  // const outputFilePath = path.join(_tempDir, `${uuidv4()}.wav`)
  // recordAudio(5, outputFilePath, '立体声混音 (Realtek High Definition Audio)')
  switch (params.type.toLowerCase()) {
      case 'start':
        // 视频录制
        if (recordingProcess) {
          event.sender.send('recording-error', '已有录制正在进行');
          return;
        }
        const uuid = uuidv4()
        const name = utils.getCurrentTime('YYYY-MM-DD_HH-mm-ss') + '.wav'
        const filePath = path.join(_out, name)
        recordingProcess = spawn('ffmpeg', [
          '-f', 'dshow',
          '-i', `audio=${params.device}`,
          '-y', // 覆盖已有文件
          // '-t', '5',
          filePath // 输出文件
        ]);
      
        recordingProcess.stderr.on('data', (data) => {
          console.log(data.toString());
          event.sender.send('ffmpeg-log', data.toString());
        });
      
        recordingProcess.on('close', (code) => {
          console.log('出错:::::', code);
          
          recordingProcess = null;
          event.sender.send('recording-finished', code);
        });
        autoStopRecordTimer = setTimeout(() => {
          if (recordingProcess) {
            recordingProcess.kill('SIGINT'); // 优雅终止 FFmpeg
            recordingProcess = null;
          }
          autoStopRecordTimer = null
          // 发消息到渲染进程
        }, 60*60*1000);
        return {path: filePath, type:'audio/wav', id:uuid,name}
        break;
      case 'stop':
        // 终止录音, 终止定时器
        if (recordingProcess) {
          recordingProcess.kill('SIGINT'); // 优雅终止 FFmpeg
          recordingProcess = null;
        }
        if (autoStopRecordTimer) {
          autoStopRecordTimer = null
        }
        return
        break;
      default:
        console.error('无效的参数，请使用 "start" 或 "stop"');
  }
}

const getAudioDevices = () => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-list_devices', 'true',
      '-f', 'dshow',       // Windows 使用 DirectShow
      '-i', 'dummy'        // 虚拟输入
    ]);
    let output = '';
    // FFmpeg 的错误流（stderr）包含设备信息
    ffmpeg.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg exited with code ${code}`));
        return;
      }
      console.log(2222, output);
      // 解析设备列表
      const audioDevices = parseAudioDevices(output);
      resolve(audioDevices);
    });
  });
}

// 解析 FFmpeg 输出，提取音频设备
function parseAudioDevices(output) {
  const lines = output.split('\n');
  const audioDevices = [];

  for (const line of lines) {
    // 匹配音频设备（Windows dshow 格式）
    const match = line.match(/"(.*? \(.*?\))" \(audio\)/);
    if (match) {
      audioDevices.push(match[1]); // 设备名称
    }
  }
  console.log(1111, audioDevices);
  return audioDevices;
}

const createShotWindow = ($event, params) => {
  console.log(222, params.win);
  if (params.win === 'create') {
    screenshotWindow.createScreenshotWindow()
  } else if (params.win === 'close') {
    console.log(1111);
    screenshotWindow.closeScreenshotWindow()
  }
}

const camWindowHandle = ($event, params) => {
  if (params.win === 'create') {
    camWindow.createCamWindow()
  } else if (params.win === 'close') {
    camWindow.closeCamWindow()
  }
}

const copyFile = ($event, params) => {
  try {
    // 确保目标目录存在
    fs.mkdirSync(params.dirPath, { recursive: true });
    // 获取文件名
    const fileName = path.basename(params.filePath);
    const targetPath = path.join(params.dirPath, fileName);
    // 复制文件
    console.log(111, params, targetPath);
    
    fs.copyFileSync(params.filePath, targetPath);
    return targetPath;
  } catch (error) {
      throw new Error(`复制文件失败: ${error.message}`);
  }
}
const delFile = ($event, params) => {
  fs.unlinkSync(params.filePath)
}

// 右键菜单
const showRightMenu = ($event, params) => {
  const menuTemp = rightMenu.getMenu(params.win)
  if (menuTemp === null) return
  const menu = Menu.buildFromTemplate(menuTemp);
  menu.popup({ window: BrowserWindow.fromWebContents($event.sender) });  
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
  ipcMain.handle('readFile', readFile)
  ipcMain.handle('copyFileToTemp',copyFileToTemp)
  ipcMain.handle('runSql',runSql)
  ipcMain.handle('updateConfig',updateConf)
  ipcMain.handle('savePwd',savePwd)
  ipcMain.handle('addPwd',addPwd)
  ipcMain.handle('delPwd', delPwd)
  ipcMain.handle('getPwdList', getPwdList)
  ipcMain.handle('toRecord', toRecord)
  ipcMain.handle('getAudioDevices',getAudioDevices)
  ipcMain.handle('createShotWindow',createShotWindow)
  ipcMain.handle('getShotPhoto', getShotPhoto)
  ipcMain.handle('copyFile',copyFile)
  ipcMain.handle('delFile',delFile)
  ipcMain.handle('camWindowHandle',camWindowHandle)
  ipcMain.handle('showRightMenu', showRightMenu)
}

export {setupIpcHandlers}
