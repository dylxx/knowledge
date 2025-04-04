
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

const utils = {
  getCurrentTime,
  toParams,
}
export default utils

export {getCurrentTime, toParams};