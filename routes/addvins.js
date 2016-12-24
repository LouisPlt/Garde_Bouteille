var express = require('express');
var session = require('express-session');
const uuidV4 = require('uuid/v4');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

/* GET home page. */
router.get('/:log/addvins/:caveId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {

	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Caves";
			var caveId = req.params.caveId;
			var params = {											//On initialise l'item recherché dans la database
			    TableName: table,
			    Key:{
			        "ID": caveId
			    }
			};

			docClient.get(params, function(err, data) {				//On récupère les donnée de la database
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



router.post('/:log/addvins/:caveId', function(req, res, next) {
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
			var winery = req.body.winery;
			var annee = req.body.annee;
			var caveId = req.params.caveId;			

			var paramsAdd = {
			    TableName: table,
			    Item:{
			    	"ID": id,
			        "Pseudo": pseudo,
			        "Winery": winery,
			        "Annee": annee,
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
