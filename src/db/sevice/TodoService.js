import { BaseService } from "@/db/sevice/BaseService.js";
import { ActivityService } from "@/db/sevice/ActivityService.js";
import { initDB } from "@/db/initDB.js";

export class TodoService extends BaseService {
  constructor() {
    super('todo');
  }
  
  async add(obj) {
    try {
      await super.add(obj);
    } catch (error) {
      if (error.name === 'ConstraintError') {
        throw new Error(`任务项: ${obj.name} 已存在`);
      } else {
        throw error;
      }
    }
  }
  
  async getList() {
    const list = await super.getList();
    return list.filter(item => item.collectionId === undefined);
  }
  
  async getTodoList() {
    const list = await super.getList();
    
    return list.filter(item =>
      item.collectionId === undefined
      && item.completed === false
      && !item.isHabit);
  }
  
  async getTodoHabitList() {
    const list = await super.getList();
    
    return list.filter(item => item.isHabit === true);
  }
  
  async getTodoCompletedList() {
    const list = await super.getList();
    
    return list.filter(item =>
      item.completed === true
      && !item.isHabit
    );
  }
  
  async getTodoActivity(todoId) {
    const activityService = new ActivityService();
    
    return await activityService.getActivityByTodoId(todoId);
  }
  
  async getTodoByTodoName(todoName) {
    const db = await initDB();
    const tx = db.transaction('todo', 'readonly');
    const store = tx.objectStore('todo');
    const index = store.index('name');
    
    return await index.get(todoName);
  }
  
  async getTodoByCollectionId(collectionId) {
    const db = await initDB();
    const tx = db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);
    const index = store.index('collectionId');
    return await index.getAll(collectionId);
  }
  
  async deleteById(todoId) {
    await super.deleteById(todoId);
    
    const activityService = new ActivityService();
    await activityService.deleteActivityByTodoId(todoId);
  }
}


