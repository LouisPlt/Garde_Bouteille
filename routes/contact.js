
var express = require('express');
var session = require('express-session');
var router = express.Router();

var sess;

router.get('/', function(req, res, next) {
    sess = req.session;
    console.log("sess.login : " + sess.login);
    if (sess.type == undefined)
        res.render('contact');
    else
        res.render('contact', { sess: sess });
});

module.exports = router;
