var express = require('express');
var session = require('express-session');
const uuidV4 = require('uuid/v4');
var multer = require('multer');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/caves')
  },
  filename: function (req, file, cb) {
    cb(null, sess.login)
  }
});

var upload = multer({ storage: storage });

/* GET home page. */
router.get('/:log/addcave', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
			res.render('addcave',  { sess: sess });
		}
	}
});


router.post('/:log/addcave', upload.single('photocave'), function(req, res, next) {					// Faire un test sur le format et les tailles
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Caves";
			var id = uuidV4();
			var pseudo = sess.login;
			var lat = req.body.lat;
			var lng = req.body.lng;
			var formatted_address = req.body.formatted_address;
			var categorie = req.body.categorie;
			var capacite = req.body.capacite;
			var temperature = req.body.temperature;
			var hygrometry = req.body.hygrometry;
			var prix = req.body.prix;
			var caracteristiques = req.body.caracteristiques;

			if (req.file == undefined)
				var photocave = false;
			else
				switch(req.file.mimetype){
					case "image/jpeg":
						var photocave = ".jpeg";
						break;
					case "image/png":
						var photocave = ".png";
						break;
					case "image/gif":
						var photocave = ".gif";
						break;
				}

			
			console.log("Adding a new item...");

			var paramsAdd = {
			    TableName: table,
			    Item:{
			    	"ID": id,
			        "Pseudo": pseudo,
			        "Formatted_address": formatted_address,
			        "Lng": lng,
			        "Lat": lat,
			        "Categorie": categorie,
			        "Capacite": capacite,
			        "Temperature": temperature,
			        "Hygrometrie": hygrometry,
			        "Prix": prix,
			        "Caracteristiques": caracteristiques,
			        "PhotoCave": photocave
			    }
			};

			docClient.put(paramsAdd, function(err, data) {
				if (err) {
					console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
			    } else {
			        console.log("Added item:", JSON.stringify(data, null, 2));
					res.redirect('/compte/' + sess.login + '/mescaves');
			    }
			});
		}
	}
});

module.exports = router;
