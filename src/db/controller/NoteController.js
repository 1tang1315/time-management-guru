import { NoteService } from "@/db/sevice/NoteService.js";
import { BaseController } from "@/db/controller/BaseController.js";

export class NoteController extends BaseController{
  constructor() {
    super(new NoteService());
  }
  
  async getNoteByTitle(title) {
    const noteService = new NoteService();
    return await noteService.getNoteByTitle(title);
  }
}