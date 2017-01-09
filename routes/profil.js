var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

router.get('/:log', function(req, res, next) {
	sess = req.session;
	if ( sess.login == undefined ) {
		res.redirect('/');
	} else {

		var docClient = new AWS.DynamoDB.DocumentClient();
		var table = "Users";
		var pseudo = sess.login;

		var params = {
		    TableName: table,
		    Key:{
		        "Pseudo": pseudo
		    }
		};

		docClient.get(params, function(err, data) {
			if (err) {
				console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
				res.redirect('/');
			} else {
				console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
				res.render('profil', { sess: sess, data: data.Item });
			}
		});
	}
});

module.exports = router;
