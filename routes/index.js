var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
const { UserModel, ChatModel } = require('../db/models')
const filterPassword = { password: 0, __v: 0 }//指定過濾的屬性

/* GET home page. */
router.get('/', function (req, res, next) {// router.get註冊一個路由 處理get請求  路由的PATH / 
  res.render('index', { title: 'Express' });
});


//註冊路由皆寫在此

//註冊一個路由：用戶註冊
/* router.post('/register', function(req, res){//此第二個參數為回調函式 - 處理 請求req、響應res、next
  //獲取請求->處理->返回響應數據
  const {username, password} = req.body
  if(username==='admin'){//註冊會失敗
    res.send({code: 1, msg: '此用户已存在'})
  }else{//註冊會成功
    res.send({code: 0, data: {id:'abc123', username, password}})
  }
}) */

//  a) path 为: /register
//  b) 请求方式为: POST
//  c) 接收 username 和 password 参数
//  d) admin 是已注册用户
//  e) 注册成功返回: {code: 0, data: {_id: 'abc', username: ‘xxx’, password:’123’}
//  f) 注册失败返回: {code: 1, msg: '此用户已存在'}


//註冊的路由
router.post('/register', function (req, res) {
  //讀取請求參數
  const { username, password, type } = req.body

  //處理 判斷用戶是否已經存在, 如果存在->返回題是錯誤的信息, 如果不存在->保存
  // 查詢(根據username)
  UserModel.findOne({ username }, function (err, user) {
    //如果user有值(已存在)
    if (user) {
      //返回題是錯誤的信息
      res.send({ code: 1, msg: 'backend: 此用戶已存在' })//                  所有res.send()返回的資料皆為 對象{}, 統一以利前端處理
    } else {
      //保存
      new UserModel({ username, type, password: md5(password) }).save((error, user) => {
        // 生成一个 cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 })
        //返回包含user的json數據
        const data = { username, type, _id: user._id }//響應數據須 去掉password
        res.send({ code: 0, data })//密碼不返回前台, 因此需上一行來封裝數據  data: data 因此簡寫
      })
    }
  })
  //返回響應數據

})

//登入的路由
router.post('/login', function (req, res) {
  const { username, password } = req.body
  //根據username和password查詢數據庫users, 如果沒有->返回題是錯誤的信息; 如果有->返回登入成功的信息(包含user)
  UserModel.findOne({ username, password: md5(password) }, filterPassword, (err, user) => {
    if (user) {//登入成功
      res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 })
      //返回登入成功的信息(包含user)
      res.send({ code: 0, data: user })
    } else {//登入失敗
      res.send({ code: 1, msg: 'backend: 帳號密碼不正確, 請重試' })
    }
  })
})

//更新用戶信息的路由
router.post('/update', function (req, res) {
  //從請求的cookie得到userid -> 在登入及註冊的路由中有存儲cookie  (cookie的值是對象 key:value)
  const userid = req.cookies.userid
  //如果不存在, 直接返回一個提示信息
  if (!userid) {
    return res.send({ code: 1, msg: 'backend: 請先登入' })
  }
  //存在, 根據 userid更新對應的user文檔數據
  //得到提交的用戶數據
  const user = req.body
  UserModel.findByIdAndUpdate({ _id: userid }, user, function (error, prevUser) {
    if (!prevUser) {
      //通知瀏覽器刪除userid cookie
      res.clearCookie('userid')
      //返回一個提示信息
      res.send({ code: 1, msg: 'backend: 請先登入' })
    } else {
      //準備一個返回的user數據對象
      const { _id, username, type } = prevUser
      const data = Object.assign({ _id, username, type }, user)
      //返回
      res.send({ code: 0, data })
    }
  })
})

//獲取用戶信息的路由(根據cookie中的userid)
router.get('/user', function (req, res) {
  //從請求的cookie得到userid -> 在登入及註冊的路由中有存儲cookie  (cookie的值是對象 key:value)
  const userid = req.cookies.userid
  //如果不存在, 直接返回一個提示信息
  if (!userid) {
    return res.send({ code: 1, msg: 'backend: 請先登入' })
  }
  // 根據userid查詢對應的user
  UserModel.findOne({ _id: userid }, filterPassword, function (error, user) {//findOne({條件}, function(){})
    res.send({ code: 0, data: user })
  })
})

//獲取用戶列表(根據類型)
router.get('/userlist', function (req, res) {  //params寫法 router.get('/userlist/:type', function(){})
  const { type } = req.query  //另有req.params寫法
  UserModel.find({ type }, filterPassword, function (error, users) {
    res.send({ code: 0, data: users })
  })
})


/*
获取当前用户所有相关聊天信息列表
*/
router.get('/msglist', function (req, res) { // 获取 cookie 中的 userid
  const userid = req.cookies.userid
  // 查询得到所有 user 文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有 user 信息: key 为 user 的_id, val 为 name 和 header 组成的 user 对象
    // const users = {} // 对象容器
    // userDocs.forEach(doc => {//這裡可以改寫為reduce
    //   users[doc._id] = { username: doc.username, header: doc.header }
    // })
    //改寫為reduce
    const users = userDocs.reduce((users, user) => {
      users[user._id] = { username: user.username, header: user.header }
      return users
    }, {})
    /*
    查询 userid 相关的所有聊天信息
    参数 1: 查询条件
    参数 2: 过滤条件
    参数 3: 回调函数
    */
    ChatModel.find({ '$or': [{ from: userid }, { to: userid }] }, filterPassword, function (err, chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({ code: 0, data: { users, chatMsgs } })
    })
  })
})
/*
修改指定消息为已读
*/
router.post('/readmsg', function (req, res) { // 得到请求中的 from 和 to
  const from = req.body.from
  const to = req.cookies.userid
  /*
  更新数据库中的 chat 数据
  参数 1: 查询条件
  参数 2: 更新为指定的数据对象
  参数 3: 是否 1 次更新多条, 默认只更新一条
  参数 4: 更新完成的回调函数
  */
  ChatModel.update({ from, to, read: false }, { read: true }, { multi: true }, function (err, doc) {
    console.log('/readmsg', doc)
    res.send({ code: 0, data: doc.nModified }) // 更新的数量
  })
})

module.exports = router;