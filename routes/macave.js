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

			var paramsReservation = {
					TableName : "Reservations",
					ProjectionExpression: "ID, Etat",
					FilterExpression :"CaveID = :caveid",
					ExpressionAttributeValues: {
						":caveid": req.params.caveId
					}
			}
			console.log("Scanning vins table.");
			docClient.scan(paramsReservation, onScan);

			function onScan(err, data) {
			    if (err) {
			        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
			        res.redirect('/');
			    } else {
			        console.log("Scan succeeded.");
			        // continue scanning if we have more movies, because
			        // scan can retrieve a maximum of 1MB of data
			        if (typeof data.LastEvaluatedKey != "undefined") {
			            console.log("Scanning for more...");
			            params.ExclusiveStartKey = data.LastEvaluatedKey;
			            docClient.scan(params, onScan);
			        }
							console.log(data.Items);
							var reponse_json = data.Items.map(function(reservation) {
							var docClient = new AWS.DynamoDB.DocumentClient();

							var paramsVin = {
									TableName : "Vins",
									ProjectionExpression: "ID, Bouteille, Quantite, Annee",
									FilterExpression :"ReservationID = :reservationid",
									ExpressionAttributeValues: {
										":reservationid": reservation.ID
									}
							}

								docClient.scan(paramsVin, function(err, vins){
									if (err) {
											console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
											res.redirect('/');
									} else {
										reponse_json.vins = vins.Items;
									}
								});
								return reponse_json;
				      });
							console.log(reponse_json);
			        res.render('macave', { sess: sess, data: data.Items });
			    }
			}
		}
	}
});

module.exports = router;
