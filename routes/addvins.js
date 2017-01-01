var express = require('express');
var session = require('express-session');
const uuidV4 = require('uuid/v4');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* new vin page. */
router.get('/:log/:reservationId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
			res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			console.log(req.params.reservationId);
			var params = {
			    TableName: "Reservations",
			    Key:{
						"ID": req.params.reservationId
			    }
			};
			docClient.get(params, function(err, data) {
				if (err) {
					console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
				} else {
					console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
					res.render('addvins', { sess: sess , reservationID: req.params.reservationId});
				}
			});
		}
	}
});



router.post('/:log/:reservationId', function(req, res, next) {
	sess = req.session;
	console.log(req.body);
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var id = uuidV4();

			var paramsAdd = {
			    TableName: "Vins",
			    Item:{
			    	"ID": id,
			      "Pseudo": sess.login,
			      "Bouteille": req.body.bouteille,
			      "Annee": req.body.annee,
			      "Categorie": req.body.categorie,
						"Quantite" : req.body.quantite,
			      "Appellation": req.body.appellation,
			      "Region": req.body.region,
			      "Vigneron": req.body.vigneron,
			      "Assurance": req.body.assurance,
			      "Caracteristiques": req.body.caracteristiques,
			      "ReservationID": req.params.reservationId
			    }
			};

			console.log("Adding a new item...");
			docClient.put(paramsAdd, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
			    } else {
			        console.log("Added item:", JSON.stringify(data, null, 2));
							res.redirect('/reservation/' + sess.login + '/'+req.params.reservationId);
			    }
			});
		}
	}

});


module.exports = router;
