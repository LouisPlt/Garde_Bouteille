
var express = require('express');
var session = require('express-session');
var router = express.Router();

var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
    sess = req.session;
    console.log("sess.login : " + sess.login);
    if (sess.type == undefined)
        res.render('about');
    else
        res.render('about', { sess: sess });
});

module.exports = router;