export class HabitActivity {
  constructor({
    todoId,
    todoName,
    clockInDay, // 打卡日期[用于更新每天的打卡状态](YYYY-MM-DD)
    status, // 打卡状态(true/false)
    count = 1, // 当天打卡次数
    createTime,
    updateTime
  }) {
    this.todoId = todoId;
    this.todoName = todoName;
    this.clockInDay = clockInDay;
    this.status = status;
    this.count = count;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}