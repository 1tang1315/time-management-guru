import { BaseService } from "@/db/sevice/BaseService.js";
import { initDB } from "@/db/initDB.js";

export class NoteService extends BaseService {
  constructor() {
    super('note');
  }
  
  async getNoteByTitle(title) {
    const db = await initDB();
    const tx = db.transaction('note', 'readonly');
    const store = tx.objectStore('note');
    const index = store.index('title');
    
    return await index.get(title);
  }
}


