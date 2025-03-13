import fs from 'fs'
import { app } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const configPath = path.join(app.getPath('userData'), 'userConfig.json');
const __dirname =dirname(fileURLToPath(import.meta.url))

function deleteFilesInDirectory(directory) {
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
          fs.rm(filePath, { recursive: true, force: true }, err => {
            if (err) console.error('删除文件夹失败:', err);
            else console.log('已删除文件夹:', filePath);
          });
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

// 调用示例
export {deleteFilesInDirectory, __dirname, getConfig, getNestedValue, updateConfig}