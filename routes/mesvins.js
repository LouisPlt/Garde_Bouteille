var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* GET home page. */
router.get('/:log/mesvins', function(req, res, next) {
	sess = req.session;
	//if ( sess.login != req.params.log ) {
	if ( false ) {
		res.redirect('/');
	} else {
		//if ( sess.type != "Oenophile") {
		if ( false) {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var paramsReservation = {
				TableName : "Reservations",
				FilterExpression: "Pseudo = :pseudo",
				ExpressionAttributeValues:{
					":pseudo" :  req.params.log,
				}
			}
			console.log("Scanning reservation table.");
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

						/*Recuperation de la cave lié a la reservation*/
						var paramsCave = {
							TableName : "Caves",
							Key : {
								'ID': reservation.CaveID
							}
						}
						docClient.get(paramsCave, function(err, data) {
							if (err) {
								console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
								res.render('/', {connected : true});
							} else {
								response_json.cave = data.Item;

								/*Recuperation des vins pour la reservation*/
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
							}

						});
					});
					waitForIt();
					function waitForIt(){
						console.log(sempahore);
						if (sempahore > 0) {
							setTimeout(function(){waitForIt()},100);
						} else {
							console.log(JSON.stringify(data.Items));
							res.render('mesvins', { sess: sess, data: data.Items });
						};
					}
				}
			}
		}
	}
});

router.get('/:log/mesvins/:vinId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var params = {
				TableName: "Vins",
				Key:{
					"ID": req.params.vinId
				}
			};

			docClient.get(params, function(err, data) {
				if (err) {
					console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
				} else {
					console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
					if (!data.Item ||  data.Item.Pseudo != sess.login){
						res.redirect('/');
					}else {
						res.render('updatemonvin',{ sess: sess, data: data.Item, vinId: data.Item.ID});
					}
				}
			});
		}
	}
});

router.post('/:log/mesvins/:vinId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var params = {
				TableName: "Vins",
				Key: {
					"ID": req.params.vinId
				},
				UpdateExpression:
				" SET Bouteille = :bouteille, Annee = :annee, Categorie = :categorie, Quantite = :quantite, Appellation = :appellation, Localite = :localite, Vigneron = :vigneron, Caracteristiques = :caracteristiques",
				ExpressionAttributeValues: {
					":bouteille": req.body.bouteille,
					":annee": req.body.annee,
					":categorie": req.body.categorie,
					":quantite" : req.body.quantite,
					":appellation": req.body.appellation,
					":localite": req.body.localite,
					":vigneron": req.body.vigneron,
					":caracteristiques": req.body.caracteristiques
				},
				ReturnValues:"UPDATED_NEW"
			};
			docClient.update(params, function(err, data) {
				if (err) {
					console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
				} else {
					console.log("GetItem updated:", JSON.stringify(data, null, 2));

					var params = {											//On initialise l'item recherché dans la database
					TableName: "Vins",
					Key:{
						"ID": req.params.vinId
					}
				};
				docClient.get(params, function(err, data) {				//On récupère les donnée de la database				//REFAIRE !!!!!!!!!!!!!!
					if (err) {
						console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
						res.redirect('/');
					} else {
						console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
						res.redirect("/reservation/"+sess.login+"/"+data.Item.ReservationID)
					}
				});
			}
		});
	}
}
});

module.exports = router;
