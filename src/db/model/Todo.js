export class Todo {
  constructor({
    collectionId,
    name,
    isTiming = false,
    isHabit = false,
    repetition = '每天', // 重复周期(每天/隔天/每周/自定义)
    remindTime = '08:00', // 提醒时间
    stopRepetitionTime = '无', // 停止重复时间
    completed = false,
    order,
    createTime,
    updateTime
  }) {
    this.collectionId = collectionId;
    this.name = name;
    this.isTiming = isTiming;
    this.isHabit = isHabit;
    this.repetition = repetition; // 重复周期(每天/周/月/年 隔天/周/月/年)
    this.remindTime = remindTime; // 提醒时间
    this.stopRepetitionTime = stopRepetitionTime; // 提醒时间
    this.completed = completed; // 是否彻底完成
    this.order = order;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}