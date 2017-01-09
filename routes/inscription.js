var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;
router.get('/', function(req, res, next) {
	res.render('inscription');
});

router.post('/', function(req, res, next) {

	sess = req.session;

	var docClient = new AWS.DynamoDB.DocumentClient();
	var table = "Users";
	var pseudo = req.body.login;
	var password = req.body.password;
	var email = req.body.email;
	var type = req.body.type;
	var gender = req.body.gender;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var birth = req.body.birth;
	var phone = req.body.phone;

	var paramsGet = {
	    TableName: table,
	    Key:{
	        "Pseudo": pseudo
	    }
	};

	var paramsAdd = {
	    TableName: table,
	    Item:{
	        "Pseudo": pseudo,
	        "Password": password,
	        "Email": email,
	        "Type": type,
	        "Gender": gender,
	        "Firstname": firstname,
	        "Lastname": lastname,
	        "Birth": birth,
	        "Phone": phone
	    }
	};


	docClient.get(paramsGet, function(err, data) {
		if (err) {
			console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
			res.redirect('/');
		} else {
			console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
			if (!isEmptyObject(data)) {							//Si le nom d'utilisateur n'existe pas
				console.log("Utilisateur déjà existant");

				res.render('inscription', { pseudo: true});
			} else {
				console.log("Adding a new item...");
				docClient.put(paramsAdd, function(err, data) {
					if (err) {
						console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
				    	res.render('inscription', { field: true});
				    } else {
				        console.log("Added item:", JSON.stringify(data, null, 2));

						sess.login = req.body.login;
						sess.type = req.body.type;
				   		res.redirect('/');
				    }
				});
			}
		}
	});

});


function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

module.exports = router;
