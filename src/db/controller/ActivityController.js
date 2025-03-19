import { ActivityService } from "@/db/sevice/ActivityService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class ActivityController extends BaseController{
  constructor() {
    super(new ActivityService());
  }
  
  async getActivityByDate(date) {
    const activityService = new ActivityService();
    
    return await activityService.getActivityByDate(date);
  }
  
  async getActivityByTodoId(todoId) {
    const activityService = new ActivityService();
    
    return await activityService.getActivityByTodoId(todoId);
  }
}