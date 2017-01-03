var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;


router.get('/', function(req, res, next) {
	res.render('connexion', {connected : true});
});


router.post('/', function(req, res, next) {

	sess = req.session;

	var docClient = new AWS.DynamoDB.DocumentClient();

	var table = "Users";
	var pseudo = req.body.login;
	var params = {
		TableName: table,
		Key:{
			"Pseudo": pseudo
		}
	};

	docClient.get(params, function(err, data) {	
		if (err) {
			console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
			res.render('connexion', {connected : false});

		} else {
			console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
			if (isEmptyObject(data)) {							//Si le nom d'utilisateur n'existe pas
				console.log("Nom d'utilisateur inexistant");

				res.render('connexion', {connected : false});
			} else {											//Si le nom d'utilisateur n'existe pas
				if (req.body.password != data.Item.Password) {
					console.log("Password erroné");
					res.render('connexion', {connected : false});
				} else {
					console.log("Connecté : " + req.body.login);
					sess.login = req.body.login;
					sess.type = data.Item.Type;
					res.redirect('/');

				}
			}
		}
	});

});

function isEmptyObject(obj) {

	return !Object.keys(obj).length;
}

module.exports = router;
