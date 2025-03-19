export class Todo {
  constructor({
                collectionId,
                name,
                isTiming = false,
                completed = false,
                order,
                createTime,
                updateTime
              }) {
    this.collectionId = collectionId;
    this.name = name;
    this.isTiming = isTiming;
    this.completed = completed; // 是否彻底完成
    this.order = order;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}