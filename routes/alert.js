var express = require('express');
var router = express.Router();
//var io = require('socket.io')(80);
var fs = require('fs');





router.get('/', function(req, res, next) {


    res.render('alert', { title: 'Express', fuckyou: 'fuckyou' });
});

module.exports = router;
