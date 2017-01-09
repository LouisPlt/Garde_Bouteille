var express = require('express');
var session = require('express-session');
var router = express.Router();

var sess;

router.get('/', function(req, res, next) {
	req.session.destroy(function(err) {
	if(err) {
	  console.log(err);
	} else {
	console.log("Disconnected");
	  res.redirect('/');
	}
	});
});

module.exports = router;
