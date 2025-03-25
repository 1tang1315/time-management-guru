export class HabitActivity {
  constructor({
    todoId,
    todoName,
    clockInTime, // 具体打卡时间(YYYY-MM-DD)
    status, // 打卡状态(成功/失败)
    createTime,
    updateTime
  }) {
    this.todoId = todoId;
    this.todoName = todoName;
    this.clockInTime = clockInTime;
    this.status = status;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}