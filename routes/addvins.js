var express = require('express');
var session = require('express-session');
const uuidV4 = require('uuid/v4');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* GET home page. */
router.get('/:log/:caveId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
			res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Caves";
			var caveId = req.params.caveId;
			var params = {
			    TableName: table,
			    Key:{
			        "ID": caveId
			    }
			};

			docClient.get(params, function(err, data) {
				if (err) {
					console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
				} else {
					console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
					res.render('addvins', { sess: sess , data: data.Item});
				}
			});
		}
	}
});



router.post('/:log/:caveId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Vins";
			var id = uuidV4();
			var pseudo = sess.login;
			var bouteille = req.body.bouteille;
			var annee = req.body.annee;
			var categorie = req.body.categorie;
			var appellation = req.body.appellation;
			var region = req.body.region;
			var vigneron = req.body.vigneron;
			var assurance = req.body.assurance;
			var caracteristiques = req.body.caracteristiques;
			var caveId = req.params.caveId;			

			var paramsAdd = {
			    TableName: table,
			    Item:{
			    	"ID": id,
			        "Pseudo": pseudo,
			        "Bouteille": bouteille,
			        "Annee": annee,
			        "Categorie": categorie,
			        "Appellation": appellation,
			        "Region": region,
			        "Vigneron": vigneron,
			        "Assurance": assurance,
			        "Caracteristiques": caracteristiques,
			        "CaveID": caveId		        
			    }
			};

			console.log("Adding a new item...");
			docClient.put(paramsAdd, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
			    } else {
			        console.log("Added item:", JSON.stringify(data, null, 2));
					res.redirect('/compte/' + sess.login + '/mesvins');
			    }
			});
		}
	}

});


module.exports = router;
