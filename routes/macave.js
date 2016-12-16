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
			var docClient = new AWS.DynamoDB.DocumentClient();
			var table = "Caves";
			var pseudo = sess.login;

			var paramsGet = {
			    TableName: table,
			    Key:{
			        "Pseudo": pseudo
			    }
			};
	
			docClient.get(paramsGet, function(err, data) {				//On récupère les donnée de la database
				if (err) {
					console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
					res.redirect('/');
				} else {
					console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
					res.render("macave", { sess: sess, data: data });
				}
			});
		}
	}
});


router.post('/:log/macave', upload.single('photocave'), function(req, res, next) {					// Faire un test sur le format et les tailles
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		if ( sess.type != "Caviste") {
			res.redirect('/');
		} else {
				var docClient = new AWS.DynamoDB.DocumentClient();
				var table = "Caves";
				var pseudo = sess.login;
				var localisation = req.body.localisation;
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

				var paramsGet = {
				    TableName: table,
				    Key:{
				        "Pseudo": pseudo
				    }
				};

				
				docClient.get(paramsGet, function(err, data) {				//On récupère les donnée de la database
					if (err) {
						console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
						res.redirect('/');
					} else {
						console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

						if (!isEmptyObject(data)) {
							console.log("Updating the item ...");

							var params = {
							    TableName: table,
							    Key: {
							        "Pseudo": pseudo
							    },
							    UpdateExpression: 											//Ne marche pas si la valeur est nulle
							        "SET Localisation = :localisation, Caracteristiques = :caracteristiques, PhotoCave = :photocave",
							    ExpressionAttributeValues: { 
							        ":localisation": localisation,
							        ":caracteristiques": caracteristiques,
							        ":photocave": photocave
							    },
							    ReturnValues:"UPDATED_NEW"
							};

							docClient.update(params, function(err, data) {

							    if (err) {
							        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
									res.redirect('/');
							    } else {
							        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
									res.redirect('/');
							    }

							});

						} else {
							console.log("Adding a new item...");

							var paramsAdd = {
							    TableName: table,
							    Item:{
							        "Pseudo": pseudo,
							        "Localisation": localisation,
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
									res.redirect('/');
							    }
							});

						}
					}

				});
			
		}
	}
});


function isEmptyObject(obj) {
  return !Object.keys(obj).length;
};


module.exports = router;
