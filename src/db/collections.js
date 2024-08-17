import { initDB } from "./initDB";
const STORE_NAME = 'collections';

export class Collection {
  constructor(name, isFold = true, todos = [], completed = false, order) {
    this.name = name;
    this.isFold = isFold;
    this.todos = todos;
    this.completed = completed; // 是否彻底完成
    this.order = order;
  }
}

export const getMaxOrder = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('order');

  let maxOrder = 0;
  let cursor = await index.openCursor(null, 'prev'); // 从高到低排序
  if (cursor) {
    maxOrder = cursor.value.order;
  }
  await tx.done;
  return maxOrder;
};

export const getAllCollections = async () => {
  const db = await initDB();
  return await db.getAllFromIndex(STORE_NAME, 'order');
};

export const getCollection = async (key) => {
  const db = await initDB();
  return await db.get(STORE_NAME, key);
}

export const removeCollection = async (key) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(key);
  await tx.done;
};

export const updateCollection = async (collection) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(collection);
  await tx.done;
};

export const addCollection = async (collection) => {
  const maxOrder = await getMaxOrder();
  collection.order = maxOrder + 1;

  const db = await initDB();
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add(collection);
    await tx.done;
  } catch (e) {
    if (e.name === 'ConstraintError') {
      throw new Error('该合集已存在');
    } else {
      throw e;
    }
  }
};