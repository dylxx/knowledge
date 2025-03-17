import { app } from 'electron'
import path from 'path'
import sqlite3 from 'sqlite3';
sqlite3.verbose()
// 获取数据库的路径
const dbPath = path.join(app.getPath('userData'), 'data.sqlite');
const sqls = {
  getAllNote: {method: 'all', sql: 'select * from notes order by createtime desc'},
  getNoteByUUID: {method: 'get', sql: 'select * from notes where uuid = :uuid'},
  getGroupByUUID: {method: 'get', sql: 'select * from groups where uuid = :uuid'},
  getAllGroup: {method: 'all', sql: 'select * from groups order by createtime desc'},
  insertGroup: {method: 'run', sql: 'insert into groups(uuid, name, createtime) values($uuid, $name, $createtime)'},
  deleteGroupByUUID: {method: 'run', sql: 'delete from groups where uuid = $uuid'},
  deleteNoteByUUID: {method: 'run', sql: 'delete from notes where uuid = $uuid'},
  getNoteByGroupId: {method: 'all', sql: 'select * from notes where groupuuid = $groupuuid order by createtime desc'},
  removeGroup: {method: 'run', sql:  `update notes set groupuuid = '' where groupuuid = $groupuuid`},
  removeNoteGroup: {method: 'run', sql:  `update notes set groupuuid = '' where uuid = $uuid`},
  saveGroup: {method: 'run', sql: `update groups set name=$name,createtime=$createtime where uuid = $uuid`},
  groupTo: {method: 'run', sql: `update notes set groupuuid = $groupuuid where uuid = $noteuuid`},
  insertNote: {method: 'run', sql: 'insert into notes(uuid, title, content, createtime) values($uuid, $title, $content, $createtime)'},
  saveNote: {method: 'run', sql: 'update notes set title=$title,content=$content,createtime=$createtime where uuid=$uuid'},
  getNoteUnGroup: {
    method: 'all',
    sql:`SELECT *
    FROM notes
    WHERE groupuuid IS NULL OR groupuuid = ''
    order by createtime desc;`
  },
  // 分页查询note
  getNotePage: {
    method: 'all',
    sql:`SELECT *
      FROM notes
      LIMIT $pagesize OFFSET $offset
      order by createtime desc;`
  },
  getNoteTotal: {method: 'get', sql: 'SELECT COUNT(*) as total FROM notes'},
  getNoteSearch: {
    method: 'all',
    sql:`SELECT *
    FROM notes
    WHERE title like $keyword or content like $keyword
    order by createtime desc;`
  },
  getTomatoList: {
    method: 'all',
    sql:`SELECT *
    FROM tomato
    order by createtime desc;`
  },
  delTomato: {
    method: 'run',
    sql:'delete from tomato where uuid = $uuid'
  },
  addTomato: {
    method: 'run',
    sql:`insert into tomato(uuid,name,createtime,minute) values($uuid,$name,$createtime,$minute)`
  },
  getPasswordList: {
    method: 'all',
    sql: `
      select * 
      from userpwd
      order by id desc
    `
  },
  savePwd: {
    method: 'run',
    sql: `
      update userpwd 
      set createtime=$createtime,
          username=$username,
          name=$name,
          password=$password,
          email=$email,
          remark=$remark,
          phonenumber=$phonenumber
      where uuid=$uuid
    `
  },
  addPwd: {
    method: 'run',
    sql: `
      insert into userpwd(name,username,password,email,phonenumber,remark,createtime,uuid) 
      values($name,$username,$password,$email,$phonenumber,$remark,$createtime,$uuid)
    `
  },
  delPwd: {
    method: 'run',
    sql: `
      delete from userpwd where uuid = $uuid
    `
  },
  getPwdSearch: {
    method: 'all',
    sql:`SELECT *
    FROM userpwd
    WHERE name like $keyword or username like $keyword
    order by createtime desc;`
  },
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('成功连接到数据库:', dbPath);
  }
});

// 初始化数据库（如果表不存在则创建）
function initDB() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        title TEXT,
        content TEXT,
        groupuuid TEXT,
        createtime TEXT
      )
    `, (err) => {
      if (err) {
        console.error('创建表失败:', err.message);
      } else {
        console.log('note表已创建或已存在');
      }
    });
    db.run(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        name TEXT,
        createtime TEXT
      )
    `, (err) => {
      if (err) {
        console.error('创建表失败:', err.message);
      } else {
        console.log('group表已创建或已存在');
      }
    });
    db.run(`
      CREATE TABLE IF NOT EXISTS tomato (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        name TEXT,
        createtime TEXT,
        minute INTEGER
      )
    `, (err) => {
      if (err) {
        console.error('创建表失败:', err.message);
      } else {
        console.log('tomato表已创建或已存在');
      }
    });
    db.run(`
      CREATE TABLE IF NOT EXISTS userpwd (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        username TEXT,
        name TEXT,
        createtime TEXT,
        password TEXT,
        email TEXT,
        remark TEXT,
        phonenumber TEXT
      )
    `, (err) => {
      if (err) {
        console.error('创建表失败:', err.message);
      } else {
        console.log('password表已创建或已存在');
      }
    });
  });
}

function getDb(name, params) {
  return new Promise((resolve, reject) => {
    db.get(sqls[name].sql, params, function (err) {
      if (err) {
        reject(err);  // 发生错误时拒绝 Promise
      } else {
        resolve(this);  // 执行成功时解析 Promise
      }
    });
  });
}

function runDb(name, params) {
  console.log('sql: ', sqls[name].sql);
  console.log('params: ', params);
  return new Promise((resolve, reject) => {
    db.run(sqls[name].sql, params, function (err) {
      if (err) {
        reject(err);  // 发生错误时拒绝 Promise
      } else {
        resolve(this);  // 执行成功时解析 Promise
      }
    });
  });
}

function allDb(name, params) {
  return new Promise((resolve, reject) => {
    db.all(sqls[name].sql, params, function (err, rows) {
      if (err) {
        reject(err);  // 发生错误时拒绝 Promise
      } else {
        resolve(rows);  // 执行成功时解析 Promise
      }
    });
  });
}

const query = async (name, params) => {
  console.log('sql: ', sqls[name].sql);
  console.log('params: ', params);
  const method = sqls[name].method
  if (method === 'all') {
    return await allDb(name, params)
  } else if(method === 'get') {
    return await getDb(name, params)
  } else if (method === 'run') {
    return await runDb(name, params)
  }
}

const execSql = async (sql, params) => {
  console.log('sql: ', sql);
  console.log('params: ', params);
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) {
        reject(err);  // 发生错误时拒绝 Promise
      } else {
        resolve(rows);  // 执行成功时解析 Promise
      }
    });
  });
}

// 关闭数据库连接
function closeDB() {
  db.close((err) => {
    if (err) {
      console.error('关闭数据库失败:', err.message);
    } else {
      console.log('数据库连接已关闭');
    }
  });
}

// 初始化数据库（仅调用一次）
initDB();

export {query, runDb, execSql, closeDB}
