import { openDB } from 'idb';

const DB_NAME = 'MyLife';
const ACTIVITIES_STORE_NAME = 'activities';
const TODOS_STORE_NAME = 'todos';
const MARKDOWNS_STORE_NAME = 'markdowns';
const COLLECTIONS_STORE_NAME = 'collections';

export const initDB = async () => {
  const db = await openDB(DB_NAME, 7, {
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
      if (!db.objectStoreNames.contains(COLLECTIONS_STORE_NAME)) {
        const store = db.createObjectStore(COLLECTIONS_STORE_NAME, { keyPath: 'name' });
        store.createIndex('order', 'order', { unique: false });
      }
    }
  });
  return db;
};