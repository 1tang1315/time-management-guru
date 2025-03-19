import { BaseService } from "@/db/sevice/BaseService.js";
import { initDB } from "@/db/initDB.js";

export class UserService extends BaseService {
  constructor() {
    super('user');
  }
}


