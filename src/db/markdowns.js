import { initDB } from "./initDB";
const STORE_NAME = 'markdowns';

export const saveToMarkdowns = async (data) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  await store.add(data);

  await tx.done;
  console.log('数据已保存到IndexedDB');
}

export const getMarkdown = async (key) => {
  const db = await initDB();
  return await db.get(STORE_NAME, key);
}

export const removeMarkdown = async (key) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(key);
  await tx.done;
};

export const updateMarkdown = async (markdown) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(markdown);
  await tx.done;
};
