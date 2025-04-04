import fs from 'fs'
import { app } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const configPath = path.join(app.getPath('userData'), 'userConfig.json');
const __dirname =dirname(fileURLToPath(import.meta.url))
const _rootPath = path.dirname(app.getPath('exe'));
const _tempDir = process.env.NODE_ENV==='development'? path.join(__dirname, 'temp'): path.join(_rootPath, 'temp')
const _out = path.join(_tempDir, 'out')
const _userDataDir = process.env.NODE_ENV==='development'? path.join(__dirname, 'userData'): path.join(_rootPath, 'userData')
const _assetsDir = process.env.NODE_ENV==='development'? path.join(__dirname, 'assets'): path.join(_rootPath, 'resources', 'assets')
function deleteFilesInDirectory(directory, delDir) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error('读取目录失败:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('获取文件信息失败:', err);
          return;
        }
        
        if (stats.isFile()) {
          fs.unlink(filePath, err => {
            if (err) console.error('删除文件失败:', err);
            else console.log('已删除文件:', filePath);
          });
        } else if (stats.isDirectory()) {
          // 删除目录
          if (delDir) {
            fs.rm(filePath, { recursive: true, force: true }, err => {
              if (err) console.error('删除文件夹失败:', err);
              else console.log('已删除文件夹:', filePath);
            });
          }
        }
      });
    });
  });
}

function getConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath));
    return {config, configPath}
  } catch (err) {
    return null
  }
}

function getNestedValue(obj, keys) {
  let result = obj;
  for (let key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return null; // 如果中途断了就返回null
    }
  }
  return result;
}

function updateConfig(newConfig) {
  const config = getConfig()
  if (!config) return
  fs.writeFileSync(configPath,JSON.stringify(newConfig), 'utf-8')
}


function encrypt(text, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decrypt(encryptedText, key) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function getCurrentTime(format) {
  const now = new Date();

  // 获取年、月、日、时、分、秒
  const year = now.getFullYear() + '';
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // 拼接成目标格式
  if (!format) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return format.replace('YYYY', year).replace('YY',year.substring(2,4)).replace('MM',month).replace('DD',day).replace('HH',hours).replace('mm',minutes).replace('ss',seconds)
}

function getFileSize(filePath) {
  try {
      // 确保路径存在
      if (!fs.existsSync(filePath)) {
          return '文件不存在';
      }

      // 获取文件大小（字节）
      const fileSizeInBytes = fs.statSync(filePath).size;

      // 计算单位换算
      return formatSize(fileSizeInBytes);
  } catch (error) {
      return `获取文件大小失败: ${error.message}`;
  }
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const utils = {
  encrypt,
  decrypt,
  deleteFilesInDirectory,
  getConfig,
  getNestedValue,
  updateConfig,
  getCurrentTime,
  getFileSize,
}
// 调用示例
export { __dirname, _rootPath, _tempDir, _userDataDir, _assetsDir,_out}
export default utils