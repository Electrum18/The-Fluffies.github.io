var io = require("socket.io").listen(3000),

  time = () => {
    var
      date = new Date(),

      minutes = date.getMinutes(),
      hour  = date.getHours(),
      day   = date.getDate(),
      month = date.getMonth() + 1

      if (minutes < 10) { minutes = "0" + minutes }
      if (   hour < 10) {    hour = "0" + hour    }
      if (    day < 10) {     day = "0" + day     }
      if (  month < 10) {   month = "0" + month   }

    return day + "." + month + " at " + hour + ":" + minutes
  },

  sendMessage = (mes, type = false, socket = false) => {
    if (type === "ann") {
      mes.notMessage = true;

      if (socket) {
        socket.emit("get announce", mes);
      } else {
        io.emit("get announce", mes);
      }

    } else if (type === "first") {
      mes.notMessage = true;

      messages.push(mes);

      if (mes.length > maxMessages) { messages.shift() };

      io.emit("get first", messages);

    } else {
      messages.push(mes);

      if (mes.length > maxMessages) { messages.shift() };

      io.emit("get message", mes);
    }
  },

  messages    = [],
  maxMessages = 100,

  users = [],
  length = 0;


io.on("connection", (socket) => {
  length++;

  io.emit("get users", length);

  socket.emit("get first", messages, "first");

  sendMessage({
    text: "Welcome to The Fluffies carrot, enjoy! :3"
  }, "ann", socket);

  socket.emit("isnt nickname");   // Reset on reconect server

  socket.on("send message", (msg) => {
    if (msg.text.length > 99) return;;

    if (!msg.name.trim() || msg.name.length > 15) {
      socket.emit("isnt nickname");

      return
    };

    msg.text = msg.text.charAt(0).toUpperCase() + msg.text.slice(1);
    msg.time = time();
    msg.id   = users[socket.id].id;

    messages.push(msg);

    if (messages.length > maxMessages) { messages.shift() };

    io.emit("get message", msg);
  });

  socket.on("check name", (name) => {
    name = name.trim()

    if (!name || name.length > 15) {
      socket.emit("isnt nickname");

      return
    };

    var sockets = Object.keys(users);

    for (var i = 0, len = sockets.length; i < len; i++) {
      if (users[sockets[i]].name === name) {
        socket.emit("isnt nickname");

        return
      };
    };

    users[socket.id] = {
      name: name,
      id: Math.round(Math.random() * 999999)
    };

    sendMessage({
      text: "#" + users[socket.id].id + " joined as " + users[socket.id].name
    }, "ann");
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      sendMessage({
        text: users[socket.id].name + " disconnected"
      }, "ann");
    };

    delete users[socket.id];

    length--;

    io.emit("get users", length);
  });
});