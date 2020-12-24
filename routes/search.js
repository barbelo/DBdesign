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

    console.log("search", data);

    pool.getConnection(function (err, connection) {
        //查询对应日期和起始站的航班
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
                        data:req.body.data
                    }));

                console.log("searchresult:", resultJson);
            // console.log(resultJson);
            res.json(resultJson);
            connection.release();

        });
    });
});

router.post('/buy', function (req, res, next) {


    let username = req.body.username;
    let airline_id = req.body.airline;
    let seat_id = req.body.seat;
    let data = req.body.data.substr(0, 10);

    pool.getConnection(function (err, connection) {
        //先判断票还是不是可以买的
        let $sql = "select ticket_id, is_sale" +
            " from ticket" +
            " where seat_id = ?" +
            " and airline_id = ?" +
            " and dataa_ = ?"
        ;

        connection.query($sql, [seat_id, airline_id, data], function (err, result) {
            // console.log($sql, [seat_id, airline_id, data]);
            // console.log(result);
            if (result[0].is_sale){
                let resultJson = {
                    code: 300,
                    msg: '被买了'
                };
                res.json(resultJson);
                connection.release();
            }
            else{
                //确认没有买过同一班航班
                let $sql3 = "select * from orders, ticket" +
                    " where orders.name = ?" +
                    " and orders.ticket_id = ticket.ticket_id" +
                    " and ticket.airline_id = ?" +
                    " and ticket.dataa_ = ?";
                // let $sql1 = "update ticket " +
                //     " set is_sale = true" +
                //     " where ticket_id = ?";
                let $sql2 = "insert into orders VALUES(default, ?, ?)";
                connection.query($sql3, [username, airline_id, data], function (err3, result3){
                    console.log("double check", result3);
                    console.log($sql3, [username, airline_id, data]);
                    if(result3?.length > 0){
                        let resultJson = {
                            code: 350,
                            msg: '买过了'
                        };
                        res.json(resultJson);
                        connection.release();
                    }
                    else {
                        // connection.query($sql1, [result[0].ticket_id], function (err1, result1) {
                            // console.log(err1);

                            connection.query($sql2, [result[0].ticket_id, username], function (err2, result2) {
                                // console.log($sql2, [result[0].ticket_id, username]);
                                let resultJson = {
                                    code: 200,
                                    msg: 'success'
                                };
                                console.log(resultJson);
                                res.json(resultJson);
                                connection.release();
                            });
                        // });
                    }
                });
            }
        });
    });
});

module.exports = router;