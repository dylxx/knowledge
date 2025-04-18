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
  addPersonRel: {
    method: 'run',
    sql: `
      insert into person_relations(uuid,name,gender,birth_date,location,relationship,contact_info,mbti_type,likes,dislikes,intersections,stories,first_meet_date,notes,avoid,active) 
      values($uuid,$name,$gender,$birth_date,$location,$relationship,$contact_info,$mbti_type,$likes,$dislikes,$intersections,$stories,$first_meet_date,$notes,$avoid,$active)
    `
  },
  savePersonRel: {
    method: 'run',
    sql: `
      update person_relations set
      name=$name,gender=$gender,birth_date=$birth_date,location=$location,relationship=$relationship,
      contact_info=$contact_info,mbti_type=$mbti_type,likes=$likes,dislikes=$dislikes,intersections=$intersections,
      stories=$stories,first_meet_date=$first_meet_date,notes=$notes,avoid=$avoid,active=$active where uuid=$uuid
    `
  },
  getPersonRelList: {
    method: 'all',
    sql: `
    select *
    from person_relations
    order by id desc
    `
  },
  deletePersonRel: {
    method: 'run',
    sql: `
    delete from person_relations where uuid=$uuid
    `
  }
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
class DatabaseInitializer {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(app.getPath('userData'), 'app-database.db');
    this.db = new sqlite3.Database(this.dbPath);
  }

  async initialize() {
    try {
      try {
        await this.createTables();
        console.log('数据库初始化完成');
      } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
      }
    } finally {
      this.db.close();
    }
  }

  createTables() {
    const tables = [
      {
        name: 'notes',
        schema: `
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL,
            title TEXT,
            content TEXT,
            groupuuid TEXT,
            createtime TEXT
          )`
      },
      {
        name: 'groups',
        schema: `
          CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL,
            name TEXT,
            createtime TEXT
          )`
      },
      {
        name: 'tomato',
        schema: `
          CREATE TABLE IF NOT EXISTS tomato (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL,
            name TEXT,
            createtime TEXT,
            minute INTEGER
          )`
      },
      {
        name: 'userpwd',
        schema: `
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
          )`
      },
      {
        name: 'person_relations',
        schema: `
          CREATE TABLE IF NOT EXISTS person_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            gender TEXT,
            birth_date TEXT,
            location TEXT,
            relationship TEXT,
            contact_info TEXT,
            mbti_type TEXT,
            likes TEXT,
            dislikes TEXT,
            intersections TEXT,
            stories TEXT,
            first_meet_date TEXT,
            notes TEXT,
            avoid TEXT,
            active TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`,
        triggers: [
          `CREATE TRIGGER IF NOT EXISTS update_person_relations_timestamp
          AFTER UPDATE ON person_relations
          FOR EACH ROW
          BEGIN
              UPDATE person_relations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
          END`
        ]
      }
    ];

    // 顺序执行所有表创建
    return tables.reduce((chain, table) => {
      return chain.then(() => {
        return this.executeQuery(table.schema, table.name)
          .then(() => {
            if (table.triggers) {
              // 顺序执行当前表的所有触发器
              return table.triggers.reduce(async (triggerChain, trigger) => {
                await triggerChain;
                return await this.executeQuery(trigger, `${table.name} trigger`);
              }, Promise.resolve());
            }
          });
      });
    }, Promise.resolve());
  }

  executeQuery(query, operationName) {
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          console.error(`创建 ${operationName} 失败:`, err.message);
          reject(err);
        } else {
          console.log(`${operationName} 已创建或已存在`);
          resolve();
        }
      });
    });
  }
}
// 使用示例
async function initDB() {
  const initializer = new DatabaseInitializer();
  try {
    return await initializer.initialize();
  } catch (error) {
    console.error('数据库初始化过程中发生错误:', error);
  }
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
