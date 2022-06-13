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
const exceptions = ['INHOUSETEST3', 'debug-20211021'];
const prob_indiv = 0;//0.05; // One of five individuals (on average) will go directly to the individual condition

/* GET home page. */
router.get('/', function(req, res, next) {
	let flag = 1;
	flag = weightedRand2({0:prob_indiv, 1:(1-prob_indiv)});
	if(typeof req.query.amazonID != 'undefined') {
		if(amazonIdList.indexOf(req.query.amazonID) == -1) {
			// inserting amazonID to the list
			amazonIdList.push(req.query.amazonID);
			// rendering
			if(flag == 1) {
				res.render('index', { 
					title: 'Online experiment',
					amazonID: req.query.amazonID
					}); //'index' = './views/index.ejs'
			} else {
				res.render('index_indiv', { 
					title: 'Online experiment',
					amazonID: req.query.amazonID
					}); //'index' = './views/index.ejs'
			}
		} else if (exceptions.indexOf(req.query.amazonID) > -1) {
			console.log('Accessed by debug ID: ' + req.query.amazonID);
			// rendering
			if(flag == 1) {
				res.render('index', { 
					title: 'Online experiment',
					amazonID: req.query.amazonID
					}); //'index' = './views/index.ejs'
			} else {
				res.render('index_indiv', { 
					title: 'Online experiment',
					amazonID: req.query.amazonID
					}); //'index' = './views/index.ejs'
			}
		} else {
			res.redirect('https://www.prolific.co/');
			console.log('Accessed by an already-existing amazonID: ' + req.query.amazonID);
		}
	} else {
		res.redirect('https://www.prolific.co/');
	}
});

module.exports = router;

function weightedRand2 (spec) {
  var i, sum=0, r=Math.random();
  for (i in spec) {
    sum += spec[i];
    if (r <= sum) return i;
  }
}
