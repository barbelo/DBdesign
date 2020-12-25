let express = require('express');
let router = express.Router();

// 实现与MySQL交互
let mysql = require('mysql');
let config = require('../model/config');
// const pool = require("mysql/lib/Pool");

var pool = mysql.createPool(config.mysql);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('passenger-register', { title: 'register' });
});


//注册功能实现
router.post('/', function (req, res, next) {
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;

    // let name = req.body.name; //获取前台请求的参数 email

    pool.getConnection(function (err, connection) {

        //先判断该账号是否存在
        let $sql = "select * from passenger where name =?";
        connection.query($sql, [username], function (err, result) {
            let resultJson = result;
            console.log(resultJson.length);
            if (resultJson.length !== 0) {
                result = {
                    code: 300,
                    msg: '该用户已申请过账号'
                };
                res.json(result);
                connection.release();
            } else {  //账号不存在，可以注册账号
                // 建立连接，向表中插入值  数据库表名为user-info会出错
                let $sql1 = "INSERT INTO passenger (name, phone) VALUES(?,?)";
                connection.query($sql1, [username, password], function (err, result) {
                    console.log(result);

                    result = {
                        code: 200,
                        msg: '注册成功',
                    };

                    res.json(result); // 以json形式，把操作结果返回给前台页面
                    connection.release();// 释放连接
                });
            }
        });
    });
});


module.exports = router;