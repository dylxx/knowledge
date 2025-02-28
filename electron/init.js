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
  // 创建note文件
  const filePath = path.join(config['filePath'], 'data.json');
  // 创建note数据
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
  //  创建群组数据
  const groupPath = path.join(config['filePath'], 'group.json');
  console.log('group: ', fs.existsSync(groupPath));
  
  if (!fs.existsSync(groupPath)) {
    fs.writeFileSync(groupPath, '[]', 'utf8');
  }
}


module.exports = {
  init,
  createFile,
  getConfig: () => config
}
