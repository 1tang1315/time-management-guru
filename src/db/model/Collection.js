export class Collection {
  constructor({
                name,
                order,
                isFolded = false,
                completed = false,
                createTime,
                updateTime
              }) {
    this.name = name;
    this.order = order;
    this.isFolded = isFolded;
    this.completed = completed; // 是否彻底完成
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}