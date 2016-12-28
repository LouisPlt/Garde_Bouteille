var express = require('express');
var session = require('express-session');
const uuidV4 = require('uuid/v4');
var AWS = require('aws-sdk');
var router = express.Router();

AWS.config.loadFromPath('./config.json');

var sess;

router.get('/:log/:reservationId', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
			res.redirect('/');
	} else {
		if ( sess.type != "Oenophile") {
			res.redirect('/');
		} else {
			var docClient = new AWS.DynamoDB.DocumentClient();
      var params = {
        TableName : "Vins",
        ProjectionExpression: "ID, Bouteille, Annee",
          FilterExpression: "ReservationID = :reservationid",
          ExpressionAttributeValues: {
               ":reservationid" : req.params.reservationId
          }
      };
      console.log("Scanning vins table.");
      docClient.scan(params, onScan);

      function onScan(err, data) {
          if (err) {
              console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
              res.redirect('/');
          } else {
              console.log("Scan succeeded.");
              if (typeof data.LastEvaluatedKey != "undefined") {
                  console.log("Scanning for more...");
                  params.ExclusiveStartKey = data.LastEvaluatedKey;
                  docClient.scan(params, onScan);
              }
              res.render('reservation', { sess: sess, data: data.Items });
          }
      }
		}
	}
});

router.post('/:log/:caveId', function(req, res, next) {
  sess = req.session;
  if ( sess.login != req.params.log ) {
    res.send('/');
  } else {
    if ( sess.type != "Oenophile") {
      res.send('/');
    } else {
      var docClient = new AWS.DynamoDB.DocumentClient();
      var id = uuidV4();

      var paramsAdd = {
          TableName: "Reservations",
          Item:{
            "ID": id,
            "CaveID": req.params.caveId,
          }
      };

      console.log("Adding a new item...");
      docClient.put(paramsAdd, function(err, data) {
        if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          res.send('/');
        } else {
            console.log("Add item:", JSON.stringify(data, null, 2));
            res.send('/reservation/' + sess.login + '/'+ id);
        }
      });
    }
  }

});
module.exports = router;
