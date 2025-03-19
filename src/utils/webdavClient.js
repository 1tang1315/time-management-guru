import { createClient } from 'webdav';
import { exportIndexedDB, importIndexedDB } from "@/db/initDB.js";

const client = createClient(
  '/jianguoyunApi',
  {
    username: '211422328@qq.com',
    password: 'a8ns38yumq2g39rm',
  }
);

/**
 * 文件上传
 * @param remotePath
 * @param localFile
 * @returns {Promise<void>}
 */
export const uploadFile = async (remotePath, localFile) => {
  const localFileJson = JSON.stringify(localFile);
  const blob = new Blob([localFileJson], { type: 'application/json' });
  
  const arrayBuffer = await blob.arrayBuffer();
  await client.putFileContents(remotePath, arrayBuffer, { overwrite: true });
};

export const downloadFile = async (remotePath) => {
  const arrayBuffer = await client.getFileContents(remotePath);

  // 使用 TextDecoder 将 ArrayBuffer 转换为字符串
  const decoder = new TextDecoder('utf-8');
  const jsonString = decoder.decode(arrayBuffer);

  // 将字符串解析为 JSON 对象
  return JSON.parse(jsonString);
};

// 增量同步方法
export const incrementSync = async () => {
  let remotePath = '/人生时间管理大师/增量同步/人生时间管理大师.json'
  try {
    // 1. 下载云端数据
    const remoteData = await downloadFile(remotePath);
    
    // 2. 读取本地数据
    const localData = await exportIndexedDB();
    
    // 3. 合并每个表的数据
    const mergedData = {
      user: mergeTableData(localData.user, remoteData.user, 'id'),
      todo: mergeTableData(localData.todo, remoteData.todo, 'id'),
      note: mergeTableData(localData.note, remoteData.note, 'id'),
      collection: mergeTableData(localData.collection, remoteData.collection, 'id'),
      activity: mergeTableData(localData.activity, remoteData.activity, 'id')
    };
    
    // 4. 保存合并数据到本地
    await importIndexedDB(mergedData);
    
    // 5. 上传新合并的数据到云端
    await uploadFile(remotePath, mergedData);
  } catch (error) {
    console.error('同步失败:', error);
  }
};

// 合并两个数据集
const mergeTableData = (localData, remoteData, primaryKey) => {
  const mergedMap = new Map();
  
  // 先合并远程数据
  remoteData.forEach(item => {
    const key = item[primaryKey];
    const existing = mergedMap.get(key);
    if (!existing || item.updateTime > existing.updateTime) {
      mergedMap.set(key, item);
    }
  });
  
  // 再合并本地数据
  localData.forEach(item => {
    const key = item[primaryKey];
    const existing = mergedMap.get(key);
    if (!existing || item.updateTime > existing.updateTime) {
      mergedMap.set(key, item);
    }
  });
  
  // 返回合并后的数组
  return Array.from(mergedMap.values());
};
