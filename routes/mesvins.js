var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
const uuidV4 = require('uuid/v4');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* GET home page. */
router.get('/:log/mesvins', function(req, res, next) {
	sess = req.session;
	var test = uuidV4();
	console.log('test : ' + test);
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Vins";
			var pseudo = sess.login;

			var params = {
			    TableName : table,
				ProjectionExpression: "ID, Pseudo",
			    FilterExpression: "Pseudo = :pseudo",
			    ExpressionAttributeValues: {
			         ":pseudo": pseudo
			    }
			};

			console.log("Scanning Movies table.");
			docClient.scan(params, onScan);

			function onScan(err, data) {
			    if (err) {
			        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
			        res.redirect('/');
			    } else {
			        // print all the movies
			        console.log("Scan succeeded.");
			        data.Items.forEach(function(vin) {
			           console.log(	
			                vin.Pseudo + ": " + vin.ID);
			        });

			        // continue scanning if we have more movies, because
			        // scan can retrieve a maximum of 1MB of data
			        if (typeof data.LastEvaluatedKey != "undefined") {
			            console.log("Scanning for more...");
			            params.ExclusiveStartKey = data.LastEvaluatedKey;
			            docClient.scan(params, onScan);
			        }
			        res.render('mesvins', { sess: sess, data: data });
			    }
			}
		}
	}
});


module.exports = router;
