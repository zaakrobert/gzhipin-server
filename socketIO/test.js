module.exports = function (server) {
  const io = require('socket.io')(server)//從bin/www傳server過來做使用

  //監視客戶端與服務器的連接
  io.on('connection', function (socket) {
    console.log('有一個客戶端連接上了服務器');
    //綁定監聽, 接收客戶端發送的消息
    socket.on('sendMsg', function (data) {
      console.log('服務器接收到客戶端發送的消息', data);
      //處理數據
      data.name = data.name.toUpperCase()
      //服務器向客戶端發送消息
      // socket.emit('receiveMsg', data)//用socket僅向單一的客戶端發送
      io.emit('receiveMsg', data)       //用socket向所有的客戶端發送
      console.log('服務器向客戶端發送消息', data);
    })
  })
}