import { TodoService } from "@/db/sevice/TodoService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class TodoController extends BaseController{
  constructor() {
    super(new TodoService());
  }
  
  async getTodoList() {
    const todoService = new TodoService();
    return await todoService.getTodoList();
  }
  async getTodoHabitList() {
    const todoService = new TodoService();
    return await todoService.getTodoHabitList();
  }
  async getTodoCompletedList() {
    const todoService = new TodoService();
    return await todoService.getTodoCompletedList();
  }
  
  async getTodoActivity(todoId) {
    const todoService = new TodoService();
    return await todoService.getTodoActivity(todoId);
  }
  
  async getTodoByTodoName(todoName) {
    const todoService = new TodoService();
    return await todoService.getTodoByTodoName(todoName);
  }
  
  async getTodoByCollectionId(collectionId) {
    const todoService = new TodoService();
    return await todoService.getTodoByCollectionId(collectionId);
  }
}