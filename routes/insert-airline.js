var express = require('express');
var router = express.Router();

// 实现与MySQL交互
var mysql = require('mysql');
var config = require('../model/config');

var pool = mysql.createPool(config.mysql);

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('insert-airline', { title: 'insert-airline' });
});


router.post('/', function (req, res, next) {
    // console.log(req.body);

    let cmpy_id = req.body.companyname;//获取前台请求的参数
    let password = req.body.password;

    pool.getConnection(function (err, connection) {
        //先判断该账号是否存在
        let $sql = "select * from air_company where cmpy_id = ?";

        connection.query($sql, [cmpy_id], function (err, result) {
            let resultJson = result;

            if (resultJson.length === 0) {

                result = {
                    code: 300,
                    msg: '该账号不存在'
                };
                res.json(result);
                connection.release();

            } else {
                //账号存在，可以登录，进行密码判断

                let $sql1 = "select cmpy_id, password from air_company where cmpy_id = ?";

                connection.query($sql1, [cmpy_id], function (err, result) {
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