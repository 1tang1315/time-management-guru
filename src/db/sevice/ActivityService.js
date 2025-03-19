import { BaseService } from "@/db/sevice/BaseService.js";
import { initDB } from "@/db/initDB.js";

export class ActivityService extends BaseService {
  constructor() {
    super('activity');
  }
  
  async getActivityByDate(date) {
    const db = await initDB();
    
    const tx = db.transaction('activity', 'readonly');
    const store = tx.objectStore('activity');
    const activityList = await store.getAll() || [];
    await tx.done;
    
    if(activityList.length <= 0) { return; }
    
    return activityList.filter(activity => activity.beginTime.startsWith(date));
  }
  
  async getActivityByTodoId(todoId) {
    const db = await initDB();
    const tx = db.transaction('activity', 'readonly');
    const store = tx.objectStore('activity');
    const index = store.index('todoId');
    
    return await index.getAll(todoId);
  }
  
  async deleteActivityByTodoId(todoId) {
    const db = await initDB();
    const tx = db.transaction('activity', 'readwrite');
    const store = tx.objectStore('activity');
    const index = store.index('todoId');
    const keys = await index.getAllKeys(todoId);

    keys.forEach(key => {
      store.delete(key);
    });
    
    await tx.done;
  }
}


