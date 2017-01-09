var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
const uuidV4 = require('uuid/v4');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;


router.get('/:log/mescaves', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Caves";
			var pseudo = sess.login;
			var params = {
			    TableName : table,
				ProjectionExpression: "ID, Pseudo, Caracteristiques, Formatted_address, Lat, Lng, Capacite",
			    FilterExpression: "Pseudo = :pseudo",
			    ExpressionAttributeValues: {
			         ":pseudo": pseudo
			    }
			};

			console.log("Scanning caves table.");
			docClient.scan(params, onScan);

			function onScan(err, data) {
			    if (err) {
			        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
			        res.redirect('/');
			    } else {
			        console.log("Scan succeeded.");
			        if (typeof data.LastEvaluatedKey != "undefined") {
			            console.log("Scanning for more...");
			            params.ExclusiveStartKey = data.LastEvaluatedKey;
			            docClient.scan(params, onScan);
			        }
			        res.render('mescaves', { sess: sess, data: data.Items });
			    }
			}
		}
	}
});



module.exports = router;
