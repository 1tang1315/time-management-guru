export class User {
  constructor({
    username,
    password,
    nickname,
    constellation,
    motto = [],
    theme,
    title,
    remote, // 远程服务 坚果云盘/百度网盘等 文件同步配置 { jianguo: { username, password }, baidu: {...} }
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
    this.remote = remote;
    this.createTime = createTime;
    this.updateTime = updateTime;
  }
}