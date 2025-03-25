import { HabitActivityService } from "@/db/sevice/HabitActivityService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class HabitActivityController extends BaseController{
  constructor() {
    super(new HabitActivityService());
  }
  
  async getHabitActivityByClockInTime(date) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.getHabitActivityByClockInTime(date);
  }
  
  async getHabitActivityByTodoId(todoId) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.getHabitActivityByTodoId(todoId);
  }
  
  async insertList(list) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.insertList(list);
  }
}