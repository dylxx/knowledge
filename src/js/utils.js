const mbtiInfo = {
  "INTJ": {
    "name": "建筑师",
    "traits": "冷静理智，战略规划者，独立思考，擅长长期规划",
    "interaction_tips": "尊重他们的独立性，不要打断他们的计划；用逻辑与他们交流，避免情绪化争论"
  },
  "INTP": {
    "name": "逻辑学家",
    "traits": "喜欢思考，追求真理，逻辑缜密，喜欢理论探讨",
    "interaction_tips": "给他们空间探索想法；鼓励他们表达观点，但不要强迫他们参与情感性的对话"
  },
  "ENTJ": {
    "name": "指挥官",
    "traits": "天生领导者，自信果断，注重效率",
    "interaction_tips": "直接清晰地表达你的想法；尊重他们的主导地位，避免拖延与模糊不清"
  },
  "ENTP": {
    "name": "辩论家",
    "traits": "充满好奇心，善于说服，喜欢挑战权威",
    "interaction_tips": "接受他们的讨论挑战，不要太敏感；欣赏他们的创意，与他们一起头脑风暴"
  },
  "INFJ": {
    "name": "提倡者",
    "traits": "理想主义者，富有洞察力，有使命感",
    "interaction_tips": "尊重他们的理想与情感深度；给予真诚的回应，避免虚伪和轻浮"
  },
  "INFP": {
    "name": "调停者",
    "traits": "温柔善良，追求内心一致，充满同理心",
    "interaction_tips": "给予他们情感支持和理解；不要批评他们的价值观，多倾听"
  },
  "ENFJ": {
    "name": "主人公",
    "traits": "有魅力，有责任感，善于激励他人",
    "interaction_tips": "重视他们的付出，回应他们的热情；表达感激之情，避免冷漠"
  },
  "ENFP": {
    "name": "竞选者",
    "traits": "热情外向，充满创意，喜欢自由",
    "interaction_tips": "保持交流活力，尊重他们的自由精神；避免过度限制他们的行为"
  },
  "ISTJ": {
    "name": "物流师",
    "traits": "务实稳重，重视规则，可靠有序",
    "interaction_tips": "守时守信，尊重传统；用事实和数据与他们沟通"
  },
  "ISFJ": {
    "name": "守护者",
    "traits": "体贴细腻，忠诚守信，乐于助人",
    "interaction_tips": "注意他们的感受，给予肯定；避免忽略他们的付出"
  },
  "ESTJ": {
    "name": "总经理",
    "traits": "直接果断，重视秩序和结果",
    "interaction_tips": "条理清晰地表达自己；尊重他们的管理方式，不要显得拖沓"
  },
  "ESFJ": {
    "name": "执政官",
    "traits": "社交达人，热心助人，重视传统",
    "interaction_tips": "参与他们组织的活动，肯定他们的努力；保持礼貌和尊重"
  },
  "ISTP": {
    "name": "鉴赏家",
    "traits": "独立冷静，实际动手能力强，喜欢探索",
    "interaction_tips": "尊重他们的空间和节奏；避免过度干涉或情绪勒索"
  },
  "ISFP": {
    "name": "探险者",
    "traits": "安静感性，追求自由，重视美和个人价值",
    "interaction_tips": "允许他们表达自我，不强迫他们解释情绪；欣赏他们的艺术气质"
  },
  "ESTP": {
    "name": "企业家",
    "traits": "外向冒险，行动力强，喜欢尝试",
    "interaction_tips": "与他们一起动手实践，行动胜于言辞；避免长篇理论"
  },
  "ESFP": {
    "name": "表演者",
    "traits": "开朗活泼，享受生活，喜欢社交",
    "interaction_tips": "加入他们的欢乐氛围，给予正面回应；避免过度严肃或打压情绪"
  }
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

function getMbtiInfo(type) {
  if(!type) {
    return mbtiInfo
  } else {
    return mbtiInfo[type]
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

const utils = {
  getCurrentTime,
  toParams,
  getMbtiInfo,
}
export default utils

export {getCurrentTime, toParams, getMbtiInfo};