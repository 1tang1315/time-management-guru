import { initDB } from "./initDB";
const STORE_NAME = 'activities';

export class Activity {
  constructor(date, text, duration, content = {}) {
    this.date = date; // 时间段  xxxx-xx-xx 至 xxxx-xx-xx
    this.text = text; // todo唯一标识
    this.duration = duration; // 分钟
    this.content = content; // experience: 心得, progress: 进度, status: 状态
  }
}

export const saveToActivities = async (data) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const record of data) {
    await store.put(record);
  }

  await tx.done;
}

export const getAllActivities = async () => {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
};

export const getActivityByKey = async (key) => {
  console.log(key);
  const db = await initDB();
  return await db.get(STORE_NAME, key);
};

export const getActivitiesByDate = async (datePrefix) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const allActivities = await store.getAll();
  const results = allActivities.filter(record => record.date.startsWith(datePrefix));
  return results;
};

// export const addActivity = async (activity) => {
//   const db = await initDB();
//   try {
//     const tx = db.transaction(STORE_NAME, 'readwrite');
//     const store = tx.objectStore(STORE_NAME);
//     await store.add(activity);
//     await tx.done;
//   } catch (e) {
//     if (e.name === 'ConstraintError') {
//       throw new Error('该活动已存在');
//     } else {
//       throw e;
//     }
//   }
// };

// export const removeActivity = async (date) => {
//   const db = await initDB();
//   const tx = db.transaction(STORE_NAME, 'readwrite');
//   const store = tx.objectStore(STORE_NAME);
//   await store.delete(date);
//   await tx.done;
// };

export const updateActivity = async (activity) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(activity);
  await tx.done;
};
