var express = require('express');
var router = express.Router();

// 实现与MySQL交互
let mysql = require('mysql');
let config = require('../model/config');
// const pool = require("mysql/lib/Pool");

var pool = mysql.createPool(config.mysql);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('search', { title: 'search' });
});

router.post('/', function (req, res, next) {
    console.log(req.body);

    let data = req.body.data;
    let departure_airport = req.body.departure;
    let arrival_airport = req.body.arrival; //获取前台请求的参数

    pool.getConnection(function (err, connection) {
        //先判断该账号是否存在
        let $sql = "select " +
            " ticket.airline_id, ticket_id, seat_id, dataa_, " +
            " departure_airport, arrival_airport, " +
            " departure_T , arrival_T " +
            // " * " +
            " from ticket, airline" +
            " where ticket.dataa_ = ?" +
            " and airline.departure_airport = ? " +
            " and airline.arrival_airport = ? " +
            " and ticket.airline_id = airline.airline_id" +
            " and ticket.is_sale = 0" +
            " group by ticket.airline_id"
        ;

        connection.query($sql, [data, departure_airport, arrival_airport], function (err, result) {

                let resultJson =
                    result?.map(x =>({
                        airline: x.airline_id,
                        seat: x.seat_id,
                        from_time:x.departure_T,
                        to_time:x.arrival_T,
                        data:x.dataa_
                    }));
            // }
            // console.log("we get result.");
            // console.log(resultJson);
            res.json(resultJson);
            connection.release();

        });
    });
});

router.post('/buy', function (req, res, next) {
    console.log(req.body);

    let username = req.body.data;
    let airline_id = req.body.airline;
    let seat_id = req.body.seat;
    let data = req.body.data;

    pool.getConnection(function (err, connection) {
        //先判断票还是不是可以买的
        let $sql = "select ticket_id, is_sale" +
            "from ticket" +
            "where seat_id = ?" +
            "and airline_id = ?" +
            "and dataa_ = ?"
        ;

        connection.query($sql, [seat_id, airline_id, dataa_], function (err, result) {
            if (result[0].is_sale){
                result = {
                    code: 300,
                    msg: '被买了'
                };
                res.json(result);
                connection.release();
            }
            else{
                let $sql1 = "update ticket " +
                    "set is_sale = true" +
                    "where ticket_id = ?";
                let $sql2 = "insert into order VALUE(default, ?, ?)";

                connection.query($sql1, [result[0].ticket_id], function (err1, result1) {
                    console.log(err);

                    connection.query($sql2, [result[0].ticket_id, username], function (err2, result2) {
                        // console.log(er);
                        result = {
                            code: 200,
                            msg: 'success'
                        };
                        res.json(result);
                        connection.release();
                    });
                });
            }
        });
    });
});

module.exports = router;