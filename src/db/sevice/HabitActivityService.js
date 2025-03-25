import { BaseService } from "@/db/sevice/BaseService.js";
import { initDB } from "@/db/initDB.js";

export class HabitActivityService extends BaseService {
  constructor() {
    super('habitActivity');
  }
  
  async getHabitActivityByClockInTime(date) {
    const db = await initDB();
    
    const tx = db.transaction('habitActivity', 'readonly');
    const store = tx.objectStore('habitActivity');
    const habitActivityList = await store.getAll() || [];
    await tx.done;
    
    if(habitActivityList.length <= 0) { return; }
    
    return habitActivityList.filter(activity => activity.clockInTime.startsWith(date));
  }
  
  async getHabitActivityByTodoId(todoId) {
    const db = await initDB();
    const tx = db.transaction('habitActivity', 'readonly');
    const store = tx.objectStore('habitActivity');
    const index = store.index('todoId');
    
    return await index.getAll(todoId);
  }
  
  async deleteHabitActivityByTodoId(todoId) {
    const db = await initDB();
    const tx = db.transaction('habitActivity', 'readwrite');
    const store = tx.objectStore('habitActivity');
    const index = store.index('todoId');
    const keys = await index.getAllKeys(todoId);

    keys.forEach(key => {
      store.delete(key);
    });
    
    await tx.done;
  }
  
  async insertList(list) {
    const db = await initDB();
    const tx = db.transaction('habitActivity', 'readwrite');
    const store = tx.objectStore('habitActivity');
    
    // 批量插入
    await Promise.all(
      list.map(record => store.add(record))
    );
    
    console.log(list);
    await tx.done;
  }
}


