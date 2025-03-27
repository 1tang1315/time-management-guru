export class Note {
  constructor({
    type,
    title,
    content,
    order,
    createTime,
    updateTime
  }) {
    this.type = type;
    this.title = title;
    this.content = content;
    this.order = order;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}