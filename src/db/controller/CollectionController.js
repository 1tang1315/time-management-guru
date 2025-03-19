import { CollectionService } from "@/db/sevice/CollectionService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class CollectionController extends BaseController{
  constructor() {
    super(new CollectionService());
  }
}