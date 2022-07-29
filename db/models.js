/* 
  包含n個操作數據庫集合數據的model模塊
*/

// 1. 连接数据库
//   1.1. 引入 mongoose
const mongoose = require('mongoose')
//   1.2. 连接指定数据库(URL 只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/gzhipin')
//   1.3. 获取连接对象
const conn = mongoose.connection
//   1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected', () => {
  console.log('db connect success!');
})


// 2. 定义出对应特定集合的 Model 并向外暴露
//   2.1. 字义 Schema(描述文档结构)
const userSchema = mongoose.Schema({
  username: { type: String, required: true }, // 用户名
  password: { type: String, required: true }, // 密码
  type: { type: String, required: true }, // 用户类型: dashen/laoban
  header: { type: String }, // 头像名称
  post: { type: String }, // 职位
  info: { type: String }, // 个人或职位简介
  company: { type: String }, // 公司名称
  salary: { type: String } // 工资
})
//   2.2. 定义 Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('user', userSchema)
//   2.3. 向外暴露 Model
// module.exports = xxx //一次性暴露
// exports.xxx = value //可寫多次 分別暴露
// exports.yyy = value
exports.UserModel = UserModel



// 定義 chats 集合的文檔結構
const chatSchema = mongoose.Schema({
  from: { type: String, required: true }, // 發送用戶的 id
  to: { type: String, required: true }, // 接收用戶的 id
  chat_id: { type: String, required: true }, // from 和 to 組成的字符串
  content: { type: String, required: true }, // 內容
  read: { type: Boolean, default: false }, // 標示是否已讀
  create_time: { type: Number } // 創建時間 -> 用於排序顯示
})
// 定義能操作 chats 集合數據的 Model
const ChatModel = mongoose.model('chat', chatSchema)// 集合為: chats
// 向外暴露 Model
exports.ChatModel = ChatModel