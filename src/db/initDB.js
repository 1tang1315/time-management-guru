import { openDB } from 'idb';

const DB_NAME = 'MyLife';
const VERSION = 2;
const ACTIVITY_STORE_NAME = 'activity';
const HABITACTIVITY_STORE_NAME = 'habitActivity';
const TODO_STORE_NAME = 'todo';
const NOTE_STORE_NAME = 'note';
const COLLECTION_STORE_NAME = 'collection';
const USER_STORE_NAME = 'user';

/**
 * 数据库初始化
 * @returns {Promise<IDBPDatabase<unknown>>}
 */
export const initDB = async () => {
  const db = await openDB(DB_NAME, VERSION, {
    upgrade(db) {
      /**
       * user
       * activity n->1 todo
       * todo n->1 collection
       * note (可关联) n->n todo collection
       */
      // user 表
      if (!db.objectStoreNames.contains(USER_STORE_NAME)) {
        const store = db.createObjectStore(USER_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        
        store.createIndex('motto', 'motto', { unique: false });
        store.createIndex('constellation', 'constellation', { unique: false });
        store.createIndex('theme', 'theme', { unique: false });
      }

      // activity 活动表
      if (!db.objectStoreNames.contains(ACTIVITY_STORE_NAME)) {
        const store = db.createObjectStore(
          ACTIVITY_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });

        store.createIndex('todoId', 'todoId', { unique: false });
      }
      
      // habitActivity 表
      if (!db.objectStoreNames.contains(HABITACTIVITY_STORE_NAME)) {
        const store = db.createObjectStore(
          HABITACTIVITY_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });

        store.createIndex('todoId', 'todoId', { unique: false });
      }

      // todo 表
      if (!db.objectStoreNames.contains(TODO_STORE_NAME)) {
        const store = db.createObjectStore(TODO_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        store.createIndex('name', 'name', { unique: false });
        store.createIndex('order', 'order', { unique: false });
        store.createIndex('collectionId', 'collectionId', { unique: false });
      }
      
      // collection 表
      if (!db.objectStoreNames.contains(COLLECTION_STORE_NAME)) {
        const store = db.createObjectStore(COLLECTION_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        store.createIndex('name', 'name', { unique: false });
        store.createIndex('order', 'order', { unique: false });
      }

      // note 表
      if (!db.objectStoreNames.contains(NOTE_STORE_NAME)) {
        const store = db.createObjectStore(NOTE_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('todoId', 'todoId', { unique: false });
        store.createIndex('collectionId', 'collectionId', { unique: false });
      }
    }
  });
  return db;
};

/**
 * 导出数据
 * @returns {Promise<{}>}
 */
export async function exportIndexedDB() {
  const db = await initDB();
  const exportData = {};

  // 获取所有对象存储的名称
  const storeNames = db.objectStoreNames;

  for (let i = 0; i < storeNames.length; i++) {
    const storeName = storeNames[i];

    // 开启一个事务
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);

    // 获取存储中的所有数据
    exportData[storeName] = await store.getAll();

    await tx.done; // 等待事务完成
  }

  return exportData;
}

/**
 * 导入数据
 * @param importData
 * @returns {Promise<void>}
 */
export async function importIndexedDB(importData) {
  const db = await initDB();
  
  let data;
  if (typeof importData === 'string') {
    try {
      data = JSON.parse(importData); // 尝试解析 JSON
    } catch (e) {
      throw new Error('importData 不是有效的 JSON 字符串！');
    }
  } else {
    data = importData; // 已经是对象，直接使用
  }
  
  const storeNames = Object.keys(data); // 获取存储表名称
  
  for (let i = 0; i < storeNames.length; i++) {
    const storeName = storeNames[i];
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // 清空当前对象存储的数据
    await store.clear();

    // 导入新数据
    const items = data[storeName];
    for (let j = 0; j < items.length; j++) {
      await store.put(items[j]);
    }

    await tx.done;
  }
}