var express = require('express');
var session = require('express-session');
var router = express.Router();

var sess;

/* GET home page. */
router.get('/:log/addvins', function(req, res, next) {
	sess = req.session;
	if ( sess.login != req.params.log ) {
		res.redirect('/');
	} else {
		res.render('addvins', { sess: sess });
	}
});


module.exports = router;
