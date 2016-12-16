var express = require('express');
var session = require('express-session');
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
router.get('/:log/macave', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
			res.render("macave", { sess: sess });
		}
	}
});


router.post('/:log/macave', upload.single('photocave'), function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
			console.log(req.file);																									//ajouter un test sur la taille
			if((req.file.mimetype != "image/png") && (req.file.mimetype != "image/jpeg") && (req.file.mimetype != "image/gif")) {
				console.log("Mettre un .gif ou .jpeg ou .png");
				res.render('macave', { sess: sess});
			} else {

				var docClient = new AWS.DynamoDB.DocumentClient();
				var table = "Caves";
				var pseudo = sess.login;
				var localisation = req.body.localisation;
				var caracteristiques = req.body.caracteristiques;
				var images = true;

				var paramsGet = {
				    TableName: table,
				    Key:{
				        "Pseudo": pseudo
				    }
				};

				var paramsAdd = {
				    TableName: table,
				    Item:{
				        "Pseudo": pseudo,
				        "Localisation": localisation,
				        "Caracteristiques": caracteristiques,
				        "images": images
				    }
				};

				docClient.get(paramsGet, function(err, data) {				//On récupère les donnée de la database
					if (err) {
						console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
						res.redirect('/');
					} else {
						console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
						if (isEmptyObject(data)) {
							console.log("Updating the item ...");
						} else {
							console.log("Adding a new item...");
						}
					}
					res.render("macave", { sess: sess});
				});
			}
		}
	}
});


function isEmptyObject(obj) {
  return !Object.keys(obj).length;
};


module.exports = router;
