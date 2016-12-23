var express = require('express');
var session = require('express-session');
var router = express.Router();
require('../models/users_model');
var dynamoose = require('dynamoose');
var User = dynamoose.model('Users');

router.get('/', function(req, res, next) {
	console.log('hello world');
	User.get("louis").then(function (badCat) {
	  console.log('Never trust a smiling cat. - ' + badCat.Lastname);
	});
	// console.log("chat: " + User.get({login: "paulet"}));
	sess = req.session;
	console.log("sess.login : " + sess.login);
  res.render('', { sess: sess });
});

module.exports = router;
