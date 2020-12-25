let express = require('express');
let router = express.Router();

// 实现与MySQL交互
let mysql = require('mysql');
let config = require('../model/config');
// const pool = require("mysql/lib/Pool");

var pool = mysql.createPool(config.mysql);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('passenger-login', { title: 'login' });
});

router.post('/', function (req, res, next) {
    console.log(req.body);

    let username = req.body.username;//获取前台请求的参数
    let password = req.body.password;

    pool.getConnection(function (err, connection) {
        //先判断该账号是否存在
        let $sql = "select * from passenger where name = ?";

        connection.query($sql, [username], function (err, result) {
            let resultJson = result;
            // console.log(resultJson.length);

            if (resultJson.length === 0) {

                result = {
                    code: 300,
                    msg: '该账号不存在'
                };
                res.json(result);
                connection.release();

            } else {
                //账号存在，可以登录，进行密码判断

                let $sql1 = "select name, password from passenger where name = ?";

                connection.query($sql1, [username], function (err, result) {
                    let temp = result[0].password;  //取得数据库查询字段值
                    // console.log(temp);

                    if (temp === password) {
                        //获取uid
                        result = {
                            code: 200,
                            msg: '密码正确',
                            uid: result[0].psg_id
                        };
                    } else {
                        result = {
                            code: 400,
                            msg: '密码错误'
                        };

                    }
                    res.json(result); // 以json形式，把操作结果返回给前台页面
                    connection.release();// 释放连接
                });
            }
        });
    });
});



module.exports = router;