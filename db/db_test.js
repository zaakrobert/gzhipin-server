/* 
  測試使用mongoose, 操作mongodb數據庫
*/
//引入md5密碼加密庫
const md5 = require('blueimp-md5')//md5加密的函示
// 1. 连接数据库
//   1.1. 引入 mongoose
const mongoose = require('mongoose')
//   1.2. 连接指定数据库(URL 只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/gzhipin_test')
//   1.3. 获取连接对象
const conn = mongoose.connection
//   1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected', () => console.log('連接數據成功～～～！'))

// 2. 得到对应特定集合的 Model
//   2.1. 字义 Schema(描述文档结构)
const userSchema = mongoose.Schema({ //指定文檔的結構,屬性名/值的類型,是否必須,默認值
  username: { type: String, required: true }, // 用户名
  password: { type: String, required: true }, // 密码
  type: { type: String, required: true }, // 用户类型: jobHunting/recruitment
  header: { type: String }
})
//   2.2. 定义 Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('user', userSchema)//此時即定義集合名稱為: users


// 3. 通过 Model 或其实例对集合数据进行 CRUD 操作
//   3.1. 通过 Model 实例的 save()添加数据
function testSave() {
  const userModel = new UserModel({ username: 'Cindy', password: md5('321'), type: 'recruitment' })//recruitment/jobHunting
  //調用save()保存數據
  userModel.save(function (error, user) {//save裡可傳入回調函式來確認保存是否成功
    console.log('save()', error, user)
  })

}
// testSave()
//   3.2. 通过 Model 的 find()/findOne() 查询多个或一个数据
function testFind() {
  //查詢多個：得到的是包含所有匹配文檔對象的數組, 若無匹配則為 []
  UserModel.find(function (error, users) {// 在find()裡傳入回調函示查詢 多個數據; 亦可傳入欲查詢的id當第一個參數{_id:'628b00d7c2fc88b8554f6959'}, function則為第二個參數
    console.log('find()', error, users);
  })
  //查詢一個：得到的是匹配文檔對象, 若無匹配則為 null
  UserModel.findOne({ _id: '628b00d7c2fc88b8554f6959' }, function (error, user) {// 在findOne()裡傳入回調函示查詢 單個數據
    console.log('findOne()', error, user);
  })
}
// testFind()

//   3.3. 通过 Model 的 findByIdAndUpdate()更新某个数据
function testUpdate() {
  UserModel.findByIdAndUpdate(
    { _id: '628afcd139f00916d196730e' },
    { username: 'Johnnathan' },
    function (error, prevUser) {
      console.log('findByIdAndUpdate()', error, prevUser);
    })
}
// testUpdate()

//   3.4. 通过 Model 的 remove()删除匹配的数据
function testDelete(){
  UserModel.remove({_id: '628afc1e18b6f770e4d016d7'}, function(error, doc){
    console.log('remove()', error, doc);
  })
}
testDelete()