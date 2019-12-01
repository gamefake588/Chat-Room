// 初始化
const _INIT_ = new InitContent();
// 验证用户
const _VERIFY_ = new VerifyUser(_INIT_);
// 注册用户
const _REGISTER_ = new Register(_INIT_);
// 群组
const _GROUP_ = new Group(_INIT_);
// 群组消息
const _GROUP_INFO_ = new GroupInfo(_INIT_, _GROUP_);
