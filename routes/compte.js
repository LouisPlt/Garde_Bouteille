var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

router.get('/:log', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
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
				res.render('compte', { sess: sess, data: data });
			}
		});
	}
});

router.post('/:log', function(req, res, next) {

	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {

		var docClient = new AWS.DynamoDB.DocumentClient();
		var table = "Users";
		var pseudo = sess.login;

		var params = {
		    TableName: table,
		    Key: {
		        "Pseudo": pseudo
		    },
		    UpdateExpression:
		        "SET Gender = :gender, Firstname = :firstname, Lastname = :lastname, Birth = :birth, Email = :email, Phone = :phone",
		    ExpressionAttributeValues: {
		    	":gender": req.body.gender,
		        ":firstname": req.body.firstname,
		        ":lastname": req.body.lastname,
		        ":birth": req.body.birth,
		        ":email": req.body.email,
		        ":phone": req.body.phone
		    },
		    ReturnValues:"UPDATED_NEW"
		};

		console.log("Updating the item...");
		docClient.update(params, function(err, data) {
		    if (err) {
		        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
				res.render('/', { sess: sess });
		    } else {
		        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
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
						sess.type = data.Item.type;
						res.render('compte', { sess: sess, data: data, check: true});
					}
				});
		    }
		});

	}
});

module.exports = router;
