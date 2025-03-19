import { openDB } from 'idb';

const DB_NAME = 'MyLife';
const VERSION = 1;
const ACTIVITIES_STORE_NAME = 'activity';
const TODOS_STORE_NAME = 'todo';
const MARKDOWNS_STORE_NAME = 'note';
const COLLECTIONS_STORE_NAME = 'collection';
const ME_STORE_NAME = 'user';

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
      if (!db.objectStoreNames.contains(ME_STORE_NAME)) {
        const store = db.createObjectStore(ME_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        
        store.createIndex('motto', 'motto', { unique: false });
        store.createIndex('constellation', 'constellation', { unique: false });
        store.createIndex('theme', 'theme', { unique: false });
      }

      // activity 活动表
      if (!db.objectStoreNames.contains(ACTIVITIES_STORE_NAME)) {
        const store = db.createObjectStore(
          ACTIVITIES_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true
          });

        store.createIndex('todoId', 'todoId', { unique: false });
      }

      // todo表
      if (!db.objectStoreNames.contains(TODOS_STORE_NAME)) {
        const store = db.createObjectStore(TODOS_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        store.createIndex('name', 'name', { unique: true });
        store.createIndex('order', 'order', { unique: true });
        store.createIndex('collectionId', 'collectionId', { unique: false });
      }

      // collection 表
      if (!db.objectStoreNames.contains(COLLECTIONS_STORE_NAME)) {
        const store = db.createObjectStore(COLLECTIONS_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        store.createIndex('name', 'name', { unique: true });
        store.createIndex('order', 'order', { unique: true });
      }

      // note 表
      if (!db.objectStoreNames.contains(MARKDOWNS_STORE_NAME)) {
        const store = db.createObjectStore(MARKDOWNS_STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        
        store.createIndex('title', 'title', { unique: true });
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

  const storeNames = Object.keys(importData);

  for (let i = 0; i < storeNames.length; i++) {
    const storeName = storeNames[i];
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // 清空当前对象存储的数据
    await store.clear();

    // 导入新数据
    const items = importData[storeName];
    for (let j = 0; j < items.length; j++) {
      await store.put(items[j]);
    }

    await tx.done;
  }
}