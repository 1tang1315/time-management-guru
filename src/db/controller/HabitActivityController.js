import { HabitActivityService } from "@/db/sevice/HabitActivityService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class HabitActivityController extends BaseController{
  constructor() {
    super(new HabitActivityService());
  }
  
  async getHabitActivityListByClockInDay(date) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.getHabitActivityListByClockInDay(date);
  }
  
  async getHabitActivityListByTodoId(todoId) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.getHabitActivityListByTodoId(todoId);
  }
  
  async getHabitActivityByClockInDayAndTodoId(date, todoId) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.getHabitActivityByClockInDayAndTodoId(date, todoId);
  }
  
  async insertList(list) {
    const habitActivityService = new HabitActivityService();
    
    return await habitActivityService.insertList(list);
  }
}