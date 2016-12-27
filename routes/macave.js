var express = require('express');
var session = require('express-session');
var multer = require('multer');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/caves')
//   },
//   filename: function (req, file, cb) {
//     cb(null, sess.login)
//   }
// });

// var upload = multer({ storage: storage });



router.get('/:log/mescaves/:caveId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Vins";
			var caveId = req.params.caveId;

			var params = {
			    TableName : table,
				ProjectionExpression: "ID, Pseudo, Bouteille, Annee",
			    FilterExpression: "CaveID = :caveId",
			    ExpressionAttributeValues: {
			         ":caveId": caveId
			    }
			};

			console.log("Scanning vins table.");
			docClient.scan(params, onScan);

			function onScan(err, data) {
			    if (err) {
			        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
			        res.redirect('/');
			    } else {
			        // print all the movies
			        console.log("Scan succeeded.");

			        // continue scanning if we have more movies, because
			        // scan can retrieve a maximum of 1MB of data
			        if (typeof data.LastEvaluatedKey != "undefined") {
			            console.log("Scanning for more...");
			            params.ExclusiveStartKey = data.LastEvaluatedKey;
			            docClient.scan(params, onScan);
			        }
			        res.render('macave', { sess: sess, data: data.Items });
			    }
			}
		}
	}
});

module.exports = router;
