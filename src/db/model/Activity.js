export class Activity {
  constructor({
    todoId,
    todoName,
    beginTime,
    endTime,
    duration,
    experience,
    createTime,
    updateTime
  }) {
    this.todoId = todoId;
    this.todoName = todoName;
    this.beginTime = beginTime;
    this.endTime = endTime;
    this.duration = duration; // 专注的持续时间
    this.experience = experience; // 心得
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}