const fs = require('fs');
const path = require('path');

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

// 调用示例
module.exports = { deleteFilesInDirectory };
