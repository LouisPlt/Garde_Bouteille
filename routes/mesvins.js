var express = require('express');
var session = require('express-session');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* GET home page. */
router.get('/:log/mesvins', function(req, res, next) {
	sess = req.session;
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
				ProjectionExpression: "ID, Pseudo, Bouteille, Annee",
			    FilterExpression: "Pseudo = :pseudo",
			    ExpressionAttributeValues: {
			         ":pseudo": pseudo
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
			        data.Items.forEach(function(vin) {
			           console.log(vin.Pseudo + ": " + vin.ID);
			        });

			        // continue scanning if we have more movies, because
			        // scan can retrieve a maximum of 1MB of data
			        if (typeof data.LastEvaluatedKey != "undefined") {
			            console.log("Scanning for more...");
			            params.ExclusiveStartKey = data.LastEvaluatedKey;
			            docClient.scan(params, onScan);
			        }
			        res.render('mesvins', { sess: sess, data: data.Items });
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
					if (data.Item.Pseudo != sess.login)
						res.redirect('/');
					else {
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
