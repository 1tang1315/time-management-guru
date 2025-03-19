import moment from "moment/moment.js";

export class BaseController {
  constructor(service) {
    this.service = service;
  }
  
  async getList() {
    return await this.service.getList();
  }
  
  async getById(id) {
    return await this.service.getById(id);
  }
  
  async add(obj) {
    if(!obj.createTime) {
      obj.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    return await this.service.add(obj);
  }
  
  async deleteById(id) {
    return await this.service.deleteById(id);
  }
  
  async update(obj) {
    obj.updateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    return await this.service.update(obj);
  }
}