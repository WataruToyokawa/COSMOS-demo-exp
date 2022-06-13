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
const exceptions = ['INHOUSETEST', 'testEmPra', 'testEmPra2'];

/* GET home page. */
router.get('/', function(req, res, next) {
	// ====== Participants from Amazon's Mechanical Turk ========================
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
	// ========== Participants from Prolific =====================================
	} else if(typeof req.query.PROLIFIC_PID != 'undefined') {
		if(amazonIdList.indexOf(req.query.PROLIFIC_PID) == -1) {
			// inserting amazonID to the list
			amazonIdList.push(req.query.PROLIFIC_PID);
			// rendering
			res.render('index', { 
				title: 'Online experiment',
				amazonID: req.query.PROLIFIC_PID
				}); //'index' = './views/index.ejs'
		} else if (exceptions.indexOf(req.query.PROLIFIC_PID) > -1) {
			console.log('Accessed by debug ID: ' + req.query.PROLIFIC_PID);
			// rendering
			res.render('index', { 
				title: 'Online experiment',
				amazonID: req.query.PROLIFIC_PID
				}); //'index' = './views/index.ejs'
		} /*else {
			res.redirect('https://www.mturk.com/');
			console.log('Accessed by an already-existing amazonID: ' + req.query.PROLIFIC_PID);
		}*/
	// Participants without any GET Query 
	} else {
		res.redirect('https://www.prolific.co');
	}
});

module.exports = router;
