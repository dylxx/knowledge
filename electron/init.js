import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { __dirname, getConfig } from "./common.js";

// 获取安装位置的路径
const rootPath = path.dirname(app.getPath('exe'));
const logFilePath = path.join(rootPath, 'app-error.log');
const tempDir = path.join(rootPath, 'temp')
const userDataDir = path.join(rootPath, 'userData')
const userDataPath = path.join(app.getPath('userData'), 'userConfig.json')
const defaultConfigPath = path.join(__dirname, 'userConfig.json');

const init = () => {
  // 确保路径可写
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true });
  }
  // 确保路径可写
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  // console.log('日志文件路径:', logFilePath);

  // 捕获错误并写入日志
  process.on('uncaughtException', (error) => {
    const errorMessage = `[${new Date().toISOString()}] Uncaught Exception: ${error.stack || error}\n`;
    fs.appendFileSync(logFilePath, errorMessage);
    console.error('Uncaught Exception:', error);
  });

  process.on('unhandledRejection', (reason) => {
    const errorMessage = `[${new Date().toISOString()}] Unhandled Rejection: ${reason.stack || reason}\n`;
    fs.appendFileSync(logFilePath, errorMessage);
    console.error('Unhandled Rejection:', reason);
  });
  initConfigFile()
}

function initConfigFile() {
  if (!getConfig()) {
    try {
      // 读取默认配置
      const defaultConfig = fs.readFileSync(defaultConfigPath, 'utf-8');
      // 写入 userConfig.json
      fs.writeFileSync(userDataPath, defaultConfig, 'utf-8');
      console.log('userConfig.json 已创建');
    } catch (err) {
      console.error('创建 userConfig.json 失败:', err);
    }
  } else {
    console.log('userConfig.json 已存在');
  }
}


// ESM 的默认导出
export {init}