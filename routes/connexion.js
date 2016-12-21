var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('connexion');
});

router.post('/', function(req, res, next) {

	sess = req.session;

	var docClient = new AWS.DynamoDB.DocumentClient();
	var table = "Users";
	var pseudo = req.body.login;
	var params = {											//On initialise l'item recherché dans la database
	    TableName: table,
	    Key:{
	        "Pseudo": pseudo
	    }
	};

	docClient.get(params, function(err, data) {				//On récupère les donnée de la database
		if (err) {
			console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
			res.redirect('/');
		} else {
			console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
			if (isEmptyObject(data)) {							//Si le nom d'utilisateur n'existe pas
				console.log("Nom d'utilisateur inexistant");
				res.render('connexion', { compte: "inexistant"});
			} else {											//Si le nom d'utilisateur existe
				if (req.body.password == data.Item.Password) {
					console.log("Connecté : " + req.body.login);
					sess.login = req.body.login;
					sess.type = data.Item.Type;
					res.redirect('/');
				} else {
					console.log("Password erroné");
					res.render('connexion',{ login: req.body.login });
				}
			}
		}
	});

});

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

module.exports = router;
