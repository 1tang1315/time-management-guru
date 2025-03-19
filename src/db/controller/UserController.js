import { UserService } from "@/db/sevice/UserService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class UserController extends BaseController{
  constructor() {
    super(new UserService());
  }
}