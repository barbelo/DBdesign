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

    let companyname = req.body.companyname;
    let airline_id = req.body.airline_id;
    let departure_T = req.body.departure_T;
    let arrival_T = req.body.arrival_T;
    let departure_airport = req.body.departure_airport;
    let arrival_airport = req.body.arrival_airport;

    pool.getConnection(function (err, connection) {

        //判断航班是否已经存在
        let $sql = "select * from airline where airline_id = ?";

        connection.query($sql, [airline_id], function (err, result) {
            let resultJson = result;

            if (resultJson.length === 0) {
                let $sql1 = "insert into airline VALUES(?, ?, ?, ?, ?, null, ?)";
                connection.query($sql1, [airline_id, departure_T,
                    arrival_T, departure_airport, arrival_airport, companyname], function (err, result) {

                    // console.log(result);
                    result = {
                        code: 200,
                        msg: 'correct insert'
                    };

                    res.json(result); // 以json形式，把操作结果返回给前台页面
                    connection.release();// 释放连接
                });

            } else {
                result = {
                    code: 300,
                    msg: '已经存在此航班号'
                };
                res.json(result);
                connection.release();
            }
        });
    });
});

module.exports = router;