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

  // 广播方法
  function onEmit(gn, data) {
    socket.broadcast.to(gn).emit(gn, data);
  }

  // 默认分组
  socket.on("group1", function(data) {
    socket.join("group1");
  });

  socket.on("msg", data => {
    //监听msg事件（这个是自定义的事件）
    console.log(data);
    let text = data.text.split("\n").join("");
    onEmit(data.gn, {
      text: text,
      id: data.id,
      name: data.name
    });
  });

  // 添加群组
  socket.on("add-group", data => {
    socket.join(data.gn);
    // 查看房间信息
    // console.log(soc.sockets.adapter.rooms);
  });

  // 切换群组
  socket.on("switch-group", data => {
    // 切换分组
    socket.leave(data.oldGn);
    socket.join(data.gn);
    console.log(soc.sockets.adapter.rooms);
  });

  socket.emit("message", {
    text: "你好,世界！",
    id: socket.id
  });
});
ser.listen(3000);
