import { initDB } from "./initDB";
const STORE_NAME = 'todos';

export class Todo {
  constructor(text, activities = [], collection, completed = false, order) {
    this.text = text;
    this.activities = activities;
    this.collection = collection;
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

export const saveToTodos = async (data) => {
  const maxOrder = await getMaxOrder();
  let currentOrder = maxOrder + 1;

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  for (const record of data) {
    try {
      record.order = currentOrder++;
      await store.add(record);
    } catch (e) {
      if (e.name === 'ConstraintError') {
        console.warn(`待办项 "${record.text}" 已存在`);
      } else {
        console.error(`添加待办项 "${record.text}" 时发生错误: ${e}`);
      }
    }
  }

  await tx.done;
  console.log('数据已保存到IndexedDB');
}

export const addTodo = async (todo) => {
  try {
    const maxOrder = await getMaxOrder();
    todo.order = maxOrder + 1;

    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.add(todo);
    await tx.done;
  } catch (e) {
    if (e.name === 'ConstraintError') {
      throw new Error('该任务项已存在');
    } else {
      throw e;
    }
  }
};

export const removeTodoByText = async (text) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(text);
  await tx.done;
};

export const updateTodo = async (todo) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(todo);
  await tx.done;
};

export const getAllTodos = async () => {
  const db = await initDB();
  return await db.getAllFromIndex(STORE_NAME, 'order');
};

export const getTodo = async (key) => {
  const db = await initDB();
  return await db.get(STORE_NAME, key);
}
