/*

Consent page
- In the background:
- give each participant a session ID
- assign each participant an unique "pay-off landscape" 
- 

*/
'use strict';

const express = require('express');
const router = express.Router();
const browser = require('browser-detect');
const amazonIdList = [];
const exceptions = ['INHOUSETEST2', 'wataruDebug', 'wataruDebug'];

/* GET home page. */
router.get('/', function(req, res, next) {
	if(typeof req.query.amazonID != 'undefined') {
		if(amazonIdList.indexOf(req.query.amazonID) == -1) {
			// inserting amazonID to the list
			amazonIdList.push(req.query.amazonID);
			// rendering
			res.render('index', { 
				title: 'Online experiment',
				amazonID: req.query.amazonID
				}); //'index' = './views/index.ejs'
		} else if (exceptions.indexOf(req.query.amazonID) > -1) {
			console.log('Accessed by debug ID: ' + req.query.amazonID);
			// rendering
			res.render('index', { 
				title: 'Online experiment',
				amazonID: req.query.amazonID
				}); //'index' = './views/index.ejs'
		} else {
			res.redirect('https://www.mturk.com/');
			console.log('Accessed by an already-existing amazonID: ' + req.query.amazonID);
		}
	} else {
		res.redirect('https://www.mturk.com/');
	}
});

module.exports = router;
