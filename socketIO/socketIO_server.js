const { ChatModel } = require('../db/models')

module.exports = function (server) {
  const io = require('socket.io')(server)//從bin/www傳server過來做使用

  //監視客戶端與服務器的連接
  io.on('connection', function (socket) {
    console.log('有一個客戶端連接上了服務器');

    //綁定監聽, 接收客戶端發送的消息
    socket.on('sendMsg', function ({from, to, content}) {
      console.log('服務器接收到客戶端發送的消息', {from, to, content});
      //處理數據(保存消息--->需要一個Model)
      //準備chatMsg對象的相關數據(const 名字一定要跟Model的數據定義的一樣)
      const chat_id = [from, to].sort().join('_')//from_to 或 to_from  --> 使用排序技巧   用sort()排字母順序   再用join('_')加入連接 A_B
      const create_time = Date.now()

      new ChatModel({from, to, content, chat_id, create_time}).save(function(error, chatMsg){
        //向所有連接的客戶端發消息 (!!!照理說應該只向對方發送消息 ex. socket.emit )
        io.emit('receiveMsg', chatMsg)//emit的名稱 "receiveMsg" 與客戶端的action socket.on裡一致
      })

    })

  })
}