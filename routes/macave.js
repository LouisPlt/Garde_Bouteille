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
	//if ( false ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
		//if ( false) {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var paramsReservation = {
					TableName : "Reservations",
					FilterExpression: "CaveID = :caveid AND NOT Etat = :etat",
					ExpressionAttributeValues:{
						":caveid" :  req.params.caveId,
						":etat" : "Initié"
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
							var sempahore = data.Items.length;
							data.Items.map(function(reservation) {
								var response_json = reservation;
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
										console.log("add vins: "+JSON.stringify(vins.Items));
										response_json.vins = vins.Items;
									}
									sempahore--;
								});
								return response_json;

				      });
							waitForIt();
							function waitForIt(){
									console.log(sempahore);
					        if (sempahore > 0) {
					            setTimeout(function(){waitForIt()},100);
					        } else {
										console.log(JSON.stringify(data.Items));
										res.render('macave', { sess: sess, data: data.Items });
					        };
					    }
			    }
			}
		}
	}
});

module.exports = router;
