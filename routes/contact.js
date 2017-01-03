var express = require('express');
var session = require('express-session');
var router = express.Router();

var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('contact');
});

module.exports = router;