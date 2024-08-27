import { initDB } from "./initDB";
const STORE_NAME = 'me';

export const getAllMe = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getMeByKey = async (key) => {
  const db = await initDB();
  return await db.get(STORE_NAME, key);
};

export const removeMe = async (date) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(date);
  await tx.done;
};

export const updateMe = async (me) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(me);
  await tx.done;
};
