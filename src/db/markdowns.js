import { initDB } from "./initDB";
const STORE_NAME = 'markdowns';

export const saveToMarkdowns = async (data) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  await store.add(data);

  await tx.done;
}

export const addMarkdown = async (markdown) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add(markdown);
    await tx.done;
  } catch (e) {
    if (e.name === 'ConstraintError') {
      throw new Error('该markdown已存在');
    } else {
      throw e;
    }
  }
};

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
