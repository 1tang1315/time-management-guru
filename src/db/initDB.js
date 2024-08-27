import { openDB } from 'idb';

const DB_NAME = 'MyLife';
const VERSION = 8;
const ACTIVITIES_STORE_NAME = 'activities';
const TODOS_STORE_NAME = 'todos';
const MARKDOWNS_STORE_NAME = 'markdowns';
const COLLECTIONS_STORE_NAME = 'collections';
const ME_STORE_NAME = 'me';

export const initDB = async () => {
  const db = await openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ACTIVITIES_STORE_NAME)) {
        db.createObjectStore(ACTIVITIES_STORE_NAME, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(TODOS_STORE_NAME)) {
        const store = db.createObjectStore(TODOS_STORE_NAME, { keyPath: 'text' });
        store.createIndex('order', 'order', { unique: false });
      }
      if (!db.objectStoreNames.contains(MARKDOWNS_STORE_NAME)) {
        db.createObjectStore(MARKDOWNS_STORE_NAME, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(ME_STORE_NAME)) {
        db.createObjectStore(ME_STORE_NAME, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(COLLECTIONS_STORE_NAME)) {
        const store = db.createObjectStore(COLLECTIONS_STORE_NAME, { keyPath: 'name' });
        store.createIndex('order', 'order', { unique: false });
      }
    }
  });
  return db;
};

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