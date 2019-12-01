const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const ser = http.Server(app);
const soc = socketIo(ser);

app.get("/", function(req, res) {
  res.send("<h1>Hello world</h1>");
});

soc.on("connection", socket => {
  //监听connection（用户连接）事件，socket为用户连接的实例
  socket.on("disconnect", () => {
    //监听用户断开事件
    console.log("用户" + socket.id + "断开连接");
  });
  console.log("用户" + socket.id + "连接");

  // 初始化
  socket.emit("message", {
    text: "你好,世界！",
    id: socket.id
  });

  // 广播方法
  function onEmit(gn, data) {
    socket.broadcast.to(gn).emit(gn, data);
  }

  // 默认分组
  socket.join("摸鱼");
  socket.on("摸鱼", function(data) {
    socket.join("摸鱼");
  });

  socket.on("msg", data => {
    //监听msg事件（这个是自定义的事件）
    console.log(data);
    let text = data.text.split("\n").join("");
    onEmit(data.gn, {
      text: text,
      id: data.id,
      name: data.name,
      gn: data.gn
    });
  });

  // 添加群组
  socket.on("add-group", data => {
    socket.join(data.gn);
  });

  // 切换群组
  socket.on("switch-group", data => {
    // 切换分组
    // socket.leave(data.oldGn);
    socket.join(data.gn);
  });

  // 加入已创建的群聊
  socket.on("join-group", data => {
    const _IF = soc.sockets.adapter.rooms[data.gn];
    socket.emit("return-join-outcome", {
      type: Boolean(_IF),
      g_info: _IF
    });
  });

  // 退出群组
  socket.on("remove-group", data => {
    socket.leave(data.gn);
  });
});
ser.listen(3000);
