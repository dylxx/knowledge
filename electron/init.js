const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// 获取安装位置的路径
const rootPath = path.dirname(app.getPath('exe'));
const logFilePath = path.join(rootPath, 'app-error.log');
const tempDir = path.join(rootPath, 'temp')

// 确保路径可写
if (!fs.existsSync(rootPath)) {
  fs.mkdirSync(rootPath, { recursive: true });
}
// 确保路径可写
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
console.log('日志文件路径:', logFilePath);

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
