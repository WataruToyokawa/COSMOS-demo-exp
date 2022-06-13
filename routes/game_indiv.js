'use strict';

const express = require('express');
const router = express.Router();
const amazonIdList = [];
const exceptions = ['INHOUSETEST3', 'wataru'];

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('reloadedPage', { 
		title: 'Questionnaire',
		amazonID: 'reloaded',
		bonus_for_waiting: 0,
		totalEarning: 0,
		exp_condition: -1,
		indivOrGroup: -1,
		confirmationID: 'XYZ-GGETQUES',
		completed: 0
		}); //'index' = './views/index.ejs'
});


/* DEBUG -- INACTIVATE WHEN YOU FINISH DEBUG*/
/*router.get('/', function(req, res, next) {
	res.render('game', { 
		title: 'Online experiment',
		amazonID: 'DEBUG'
	});
});
*/

/* POST home page. */
router.post('/', function(req, res, next) {
	if(typeof req.body.amazonID != 'undefined') {
		if(amazonIdList.indexOf(req.body.amazonID) == -1) {
			// inserting amazonID to the list
			amazonIdList.push(req.body.amazonID);
			// rendering
			res.render('game_indiv', { 
				title: 'Online experiment',
				amazonID: req.body.amazonID//,
				//bonus_for_waiting: req.body.bonus_for_waiting,
				//totalGamePayoff: req.body.totalGamePayoff,
				//experimentalID: req.body.experimentalID,
				//exp_condition: req.body.exp_condition
			}); 
		} else if (exceptions.indexOf(req.body.amazonID) > -1) {
			console.log('Accessed by debug ID: ' + req.body.amazonID);
			// rendering
			res.render('game_indiv', { 
				title: 'Online experiment',
				amazonID: req.body.amazonID
			}); 
		} else {
			res.render('multipleAccess');
			console.log('Accessed by an already-existing ID: ' + req.body.amazonID);
		}
	} else {
		res.redirect('https://www.prolific.co/');
	}
		// get('/', function()~) you might wonder why '/' rather than 'questionnaire'? 
		// The path would lead the requester to the lower layer '/questionnaire/~'
		// So for example, if you want to have a debug mode, 
		// you can write '/debug' and put a function for debug
});

/* GET home page. */
/*router.get('/', function(req, res, next) {
	const data = {
		title: 'Game!'
	};
	res.render('game', data);
});*/

module.exports = router;
