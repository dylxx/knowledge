// init.js
const fs = require('fs');
const path = require('path');
let config = {}
function init() {
  // 初始化操作, 创建文件
  readConfig()
  createFile()
}

function readConfig() {
  // 读取 JSON 文件
  const jsonFilePath = './electron/config.json'; // 假设 JSON 文件路径
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');  // 读取 JSON 文件内容

  // 解析 JSON 数据
  const data = JSON.parse(jsonData);
  
  config = data
}

function createFile() {
  // 获取 file-path 属性
  const filePath = config['filePath']; // 假设 JSON 文件中有 'file-path' 属性

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    // 如果文件不存在，则创建文件
    const content = '{}';
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`创建文件: ${filePath}`);
  }
}

module.exports = {
  init,
  createFile,
  getConfig: () => config
}
