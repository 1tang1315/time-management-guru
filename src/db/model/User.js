export class User {
  constructor({
    username,
    password,
    nickname,
    constellation,
    motto = [],
    theme,
    title,
    createTime,
    updateTime
  }) {
    this.username = username;
    this.password = password;
    this.nickname = nickname;
    this.constellation = constellation; // 星座
    this.motto = motto; // 座右铭
    this.theme = theme;
    this.title = title;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}