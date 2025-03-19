import { initDB } from '../initDB.js';

export class BaseService {
  constructor(storeName) {
    this.storeName = storeName;
  }

  async getMaxOrder () {
    const db = await initDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    const index = store.index('order');

    let maxOrder = 0;
    let cursor = await index.openCursor(null, 'prev'); // 从高到低排序
    if (cursor) {
      maxOrder = cursor.value.order;
    }
    await tx.done;
    return maxOrder;
  };

  async getList() {
    const db = await initDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    
    const list = await store.getAll();
    
    // 检查是否有 order 字段
    if (list.length > 0 && list[0].order !== undefined) {
      // 根据 order 字段从小到大排序
      list.sort((a, b) => a.order - b.order);
    }
    
    return list;
  }

  async getById(id) {
    const db = await initDB();

    return await db.get(this.storeName, id);
  }

  async add(obj) {
    if(this.storeName === 'todo' || this.storeName === 'collection') {
      const maxOrder = await this.getMaxOrder();
      obj.order = maxOrder + 1;
    }

    const db = await initDB();
    try {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      await store.add(obj);
      await tx.done;
    } catch (e) {
        throw e;
    }
  };
  
  async deleteById(id) {
    const db = await initDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await store.delete(id);
    await tx.done;
  };
  
  async update (obj) {
    const db = await initDB();
    const tx = db.transaction(this.storeName, 'readwrite');
    const store = tx.objectStore(this.storeName);
    await store.put(obj);
    await tx.done;
  };
}


