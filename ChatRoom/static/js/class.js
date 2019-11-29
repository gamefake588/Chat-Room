/**
 * 初始化内容
 */
class InitContent {
  HTTP_TEST = "localhost"; // 测试环境
  HTTP_PRODUCTION = `192.168.0.100`; // 生产环境

  CONTENT; // 内容区域
  CONTENT_DIV; // 内容
  SOCKET; // socket
  SOCKET_ID; // 当前的socket_ID
  ROOM_GROUP; // 分组
  SUBMIT; // 提交元素

  USER_NAME; // 用户名
  USER_IMG; //用户头像

  constructor() {
    this.CONTENT = document.querySelector(".room-right-content");
    this.CONTENT_DIV = this.CONTENT.getElementsByTagName("div");
    this.SOCKET = io.connect(`ws://${this.HTTP_TEST}:3000`);
    this.SUBMIT = document.getElementById("submit");
    this.ROOM_GROUP = "group1";

    // 初始化内容区域
    this.onContentArea();
    // 初始化socket
    this.onSooket(this.ROOM_GROUP);
    // 监听分组聊天内容
    this.onListenChats(this.ROOM_GROUP);
    // 绑定事件
    this.onEvent();
  }

  // 初始化内容区域
  onContentArea() {
    let up = this.CONTENT_DIV[this.CONTENT_DIV.length - 2];
    if (up) {
      let t = up ? up.offsetTop + up.clientHeight : 20;
      this.CONTENT_DIV[this.CONTENT_DIV.length - 1].style.top = t + 20 + "px";
    }
  }

  // 初始化socket
  onSooket(group) {
    this.SOCKET.emit(group);
    this.SOCKET.on("message", data => {
      console.log(data);
      this.SOCKET_ID = data.id;
    });
  }

  // 监听分组聊天内容
  onListenChats(group) {
    this.SOCKET.on(group, data => {
      console.log(data);
      switch (true) {
        case String(data.id) !== String(this.SOCKET_ID):
          this.onCreateDiv("content-peer", data.text, data.name);
          this.onContentArea();
          this.atBottom();
          break;
      }
    });
  }

  // 创建内容元素
  onCreateDiv(className, val, name) {
    const div = document.createElement("div");
    div.className = className;
    div.innerHTML = this.ifRoleConvert(className, val, name);
    this.CONTENT.appendChild(div);
  }

  // 获取用户信息
  getUserInfo() {
    this.USER_NAME = sessionStorage.getItem("CHAT_ROOM_NAME");
  }

  // 根据发送者角色转换
  ifRoleConvert(className, val, name) {
    let _img = `<section class="user-img"><img src="./static/img/test_img.gif" class="radius"></section>`;
    let _info = `<section class="user-content">
      <section class="user-content-info">
        ${name}
      </section>
      <section class="user-content-data">${val}</section>
    </section>`;

    switch (className) {
      case "content-peer":
        return _img + _info;
      case "content-me":
        return _info + _img;
    }
  }

  // 固定底部
  atBottom() {
    this.CONTENT.scrollTop = this.CONTENT.scrollHeight;
  }

  // 内容验证
  onContentVerify(val) {
    switch (true) {
      case val.length > 255:
        break;
    }
  }

  // 发送内容
  initEmitContent() {
    // 获取用户信息
    this.getUserInfo();
    const contents = document.getElementById("content");
    this.onCreateDiv("content-me", contents.value, this.USER_NAME);
    this.SOCKET.emit("msg", {
      text: contents.value,
      id: this.SOCKET_ID,
      name: this.USER_NAME,
      gn: this.ROOM_GROUP
    });
    this.onContentArea();
    this.atBottom();
    contents.value = "";
  }

  // 绑定事件
  onEvent() {
    this.SUBMIT.onclick = () => this.initEmitContent();
    document.getElementById("content").onkeydown = e => {
      if (e.keyCode === 13 && e.key === "Enter") this.initEmitContent();
    };
  }
}

/**
 * 验证用户
 */
class VerifyUser {
  PUBLIC_BODY; // 全局
  PUBLIC_CHAT_ROOM_NAME; // 用户名
  PUBLIC_VERIFY_TYPE; // 验证状态
  ROOM_EMIT; // 聊天框

  constructor() {
    // 聊天框
    this.ROOM_EMIT = document.getElementById("ifUser");
    // 已经登录的用户名
    this.PUBLIC_CHAT_ROOM_NAME = sessionStorage.getItem("CHAT_ROOM_NAME");
    // Body
    this.PUBLIC_BODY = document.body;
    // 验证状态
    this.PUBLIC_VERIFY_TYPE = this.onVerifier();
    // 切换器
    this.onSwitcher();
    // 全局事件
    this.onPublic();
  }

  // 全局事件委托
  onPublic() {
    this.PUBLIC_BODY.onclick = () => {
      // 验证状态
      this.PUBLIC_VERIFY_TYPE = this.onVerifier();
      // 切换器
      this.onSwitcher();
    };
  }

  // 验证器
  onVerifier() {
    this.PUBLIC_CHAT_ROOM_NAME = sessionStorage.getItem("CHAT_ROOM_NAME");
    let e = this.PUBLIC_CHAT_ROOM_NAME;
    switch (true) {
      case !e:
        return false;
      default:
        return true;
    }
  }

  // 切换器
  onSwitcher() {
    this.PUBLIC_VERIFY_TYPE
      ? this.onTrueOperating()
      : this.onProhibitOperating();
  }

  // 用户登录允许操作
  onTrueOperating() {
    let html = `
    <textarea id="content" maxlength="255" placeholder="点击我"></textarea>
    `;
    if (this.ROOM_EMIT.innerHTML === html) return false;
    this.ROOM_EMIT.innerHTML = html;
  }

  // 用户未登录禁止操作
  onProhibitOperating() {
    this.ROOM_EMIT.innerHTML = `
    <div class="emit-ban">
      游客朋友你好, 请
      <span>登录</span>
      后参与聊天
    </div>
    `;
  }
}

/**
 * 弹出模态框
 */
class ModelBox {
  MODEL; // 模态框
  MODEL_DOM; // 模态框DOM
  MODEL_TITLE; // 模态框标题
  MODEL_HINT; // 模态框内容提示
  MODEL_CLOSE; // 关闭按钮
  MODEL_BTN; // 操作按钮

  /**
   * 构造函数
   * @param {String} title
   * @param {String} hint
   * @param {Boolean} isShow
   */
  constructor(title, hint, isShow) {
    if (!isShow) return false;
    // 生成DOM结构
    this.dom(title, hint);
    // 创建模态框
    this.MODEL = this.createModel();
    // 关闭按钮
    this.MODEL_CLOSE = document.querySelector(".pop-close");
    // 确定按钮
    this.MODEL_BTN = document.querySelector(".register-btn");
    // 关闭按钮绑定事件
    this.closeBtn();
  }

  // 创建模态框
  createModel() {
    const _DIV = document.createElement("div");
    _DIV.className = "pop";
    _DIV.innerHTML = this.MODEL_DOM;
    document.body.appendChild(_DIV);
    return _DIV;
  }

  // 关闭
  closeModel() {
    document.body.removeChild(this.MODEL);
  }

  // 关闭按钮
  closeBtn() {
    this.MODEL_CLOSE.onclick = () => this.closeModel();
  }

  // 模态框DOM结构
  dom(title, hint) {
    this.MODEL_DOM = `
    <div class="pop-body">
        <div class="pop-title clear">
          <span>${title}</span>
          <span class="pop-close">x</span>
        </div>
        <div class="pop-info">
          <div>
            <span class="pop-info-title">${hint}</span>
            <input type="text" placeholder="|" value='test' id="val" />
          </div>
          <div class="clear register-btn">
            <button id="register">确定</button>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * 注册用户
 */
class Register {
  MODEl; // 模态框
  USER_NAME; // 用户名
  CHAT_ROOM_NAME; // 已经登录的用户名

  constructor() {
    // 已经登录的用户名
    this.CHAT_ROOM_NAME = sessionStorage.getItem("CHAT_ROOM_NAME");
    // 验证是否注册
    if (!this.IfRegister()) {
      this.MODEl = new ModelBox("加入聊天室", "请输入用户名", true);
      this.onEven();
    }
  }

  // 绑定事件
  onEven() {
    this.MODEl.MODEL_BTN.onclick = () => this.createUser();
  }

  // 创建用户
  createUser() {
    this.USER_NAME = document.getElementById("val").value;
    switch (true) {
      case this.USER_NAME === "" || !this.USER_NAME:
        alert(`请输入用户名`);
        break;
      case this.USER_NAME.length > 8:
        alert(`用户名不能超过8位`);
        break;
      default:
        sessionStorage.setItem("CHAT_ROOM_NAME", this.USER_NAME);
        this.MODEl.closeModel();
    }
  }

  // 验证是否注册
  IfRegister() {
    return this.CHAT_ROOM_NAME ? true : false;
  }
}

/**
 * 群组
 */
class Group {
  MODEL; //模态框
  SOCKET; //socket
  CREATE_GROUP_BTN; //添加群按钮
  GROUP_NAME; //群名称
  OLD_GN = `group1`; // 上一个群聊(默认group1)

  constructor(socket) {
    this.SOCKET = socket;
    // 添加群按钮
    this.CREATE_GROUP_BTN = document.querySelector(".room-add");
    // 绑定事件
    this.onEven();
  }

  // 创建群组
  createGroup() {
    if (this.onVerify(this.GROUP_NAME)) {
      _INIT_.SOCKET.emit("add-group", {
        gn: this.GROUP_NAME,
        gid: _INIT_.SOCKET_ID
      });
      // 创建dom结构
      this.onAddGrorup(this.GROUP_NAME);
      // 绑定切换事件
      this.onSwitchGroup(this.SwitchGroup);
      // 关闭模态框
      this.MODEL.closeModel();
    }
  }

  // 添加群组方法
  onAddGrorup(name) {
    const _ = document.querySelector(".room-list");
    _.appendChild(this.Group(name));
  }

  // DOM结构
  Group(name) {
    const _ = document.createElement("li");
    const _time_ = new Date()
      .toLocaleString()
      .split(" ")[0]
      .split("/")
      .join("-");

    _.className = "room-user-row";
    _.dataset.gn = name;
    _.innerHTML = `
    <div class="user-row-img">
      <img src="./static/img/test_img.gif" class="icon-s radius" />
    </div>
    <div class="user-row-info">
      <span>${name}</span>
      <p>${_time_}</p>
    </div>
    `;
    return _;
  }

  // 群组名验证
  onVerify(val) {
    switch (true) {
      case !val:
        alert("请输入群名称");
        break;
      case val.length > 12:
        alert("群名称不能超过12位数");
        break;
      default:
        return true;
    }
  }

  // 获取群组列表
  getGroupList() {
    return document.querySelectorAll(".room-user-row");
  }

  // 绑定切换群聊事件
  onSwitchGroup(fn) {
    this.getGroupList().forEach(item => {
      item.onclick = e => fn | fn(e, this);
    });
  }

  // 切换群聊方法
  SwitchGroup(e, _this) {
    // 切换分组
    console.log(e.currentTarget.dataset.gn);
    _INIT_.SOCKET.emit("switch-group", {
      gn: e.currentTarget.dataset.gn,
      oldGn: _this.OLD_GN
    });
  }

  // 绑定事件
  onEven() {
    // 弹出创建群组模态框
    this.CREATE_GROUP_BTN.onclick = () => {
      this.MODEL = new ModelBox("创建群组", "请输入群组名", true);
      // 创建事件
      this.MODEL.MODEL_BTN.onclick = () => {
        this.GROUP_NAME = document.getElementById("val").value;
        this.createGroup();
      };
    };

    // 点击切换群组
    this.onSwitchGroup(this.SwitchGroup);
  }
}
