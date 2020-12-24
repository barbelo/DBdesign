var express = require('express');
var router = express.Router();


// 实现与MySQL交互
let mysql = require('mysql');
let config = require('../model/config');

var pool = mysql.createPool(config.mysql);


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('order', { title: 'order' });
});

router.post('/', function (req, res, next) {
    // console.log(req.body);

    let username = req.body.username;

    // console.log("search", data);

    pool.getConnection(function (err, connection) {

        // <td>{{ x.airline }}</td>
        // <td>{{ x.departure }}</td>
        // <td>{{ x.arrival }}</td>
        // <td>{{ x.day }}</td>
        // <td>{{ x.seat }}</td>

        let $sql = "select ticket.airline_id, seat_id, dataa_, " +
            " departure_airport, arrival_airport" +
            " from airline, ticket, orders" +
            " where airline.airline_id = ticket.airline_id" +
            " and orders.name = ?" +
            " and orders.ticket_id = ticket.ticket_id"
        ;

        connection.query($sql, [username], function (err, result) {

            let resultJson =
                result?.map(x =>({
                    airline: x.airline_id,
                    departure: x.departure_airport,
                    arrival: x.arrival_airport,
                    seat:x.seat_id,
                    data: x.dataa_
                }));

            console.log("orderresult:", resultJson);
            // console.log(resultJson);
            res.json(resultJson);
            connection.release();

        });
    });
});



module.exports = router;