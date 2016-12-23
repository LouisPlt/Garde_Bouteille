var express = require('express');
var session = require('express-session');
var router = express.Router();
require('../models/users_model');
var dynamoose = require('dynamoose');
var Users = dynamoose.model('Users');
var sess;

/* GET home page. */
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
