var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

router.get('/', function(req, res, next) {
	sess = req.session;
	if ( sess.type != "Oenophile") {
		res.redirect('/');
	} else {

		var docClient = new AWS.DynamoDB.DocumentClient();
		var table = "Caves";
		var pseudo = sess.login;
		var params = {
		    TableName : table,
			ProjectionExpression: "ID, Caracteristiques, Pseudo, Formatted_address, Lat, Lng, Prix"
		};
		docClient.scan(params, onScan);

		function onScan(err, data) {
		    if (err) {
		        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
		        res.redirect('/');
		    } else {
		        console.log("Scan succeeded.");
		        data.Items.forEach(function(caves) {
	        		console.log(caves.Pseudo + ": " + caves.Caracteristiques + " / " + caves.Formatted_address + " / " + caves.Lat + " / " + caves.Lng);
		        });

		        if (typeof data.LastEvaluatedKey != "undefined") {
		            console.log("Scanning for more...");
		            params.ExclusiveStartKey = data.LastEvaluatedKey;
		            docClient.scan(params, onScan);
		        }
						res.render('recherche', { sess: sess, caves: data });
		    }
		}
	}
});

module.exports = router;
