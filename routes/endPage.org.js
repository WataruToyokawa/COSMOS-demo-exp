'use strict';

// 10 July 2019 *******************
// ** README: THIS FILE IS NOT USED ANY MORE. RENDERING TO ENDPAGE.JS IS DONE IN APP.JS
//

const csv = require("fast-csv")
,	fs = require('fs')
,	path = require("path")
,	express = require('express')
,	router = express.Router()
;



/* GET home page. */
router.get('/', function(req, res, next) {
	//res.send('This is a questionnaire page.'); 
});

/* POST home page. */
router.post('/', function(req, res, next) {

	let save_data = new Object();
    save_data.exp_condition = req.body.exp_condition;
    save_data.indivOrGroup = req.body.indivOrGroup;
    save_data.confirmationID = req.body.confirmationID;
    save_data.amazonID = req.body.amazonID;
    save_data.totalEarning = Math.round(parseInt(req.body.totalEarning))/100;
    save_data.bonus_for_waiting = Math.round(parseInt(req.body.bonus_for_waiting))/100;
    //save_data.totalPayment = req.body.bonus_for_waiting + req.body.totalEarning + 0.25;
    save_data.totalPayment = Math.round(10*(parseInt(req.body.bonus_for_waiting)/100 + parseInt(req.body.totalEarning)/100 + 0.80))/10;
    save_data.q1 = req.body.q1;
	save_data.q2 = req.body.q2;
	save_data.q3 = req.body.q3;
	save_data.q4 = req.body.q4;
	save_data.age = req.body.age;
	save_data.sex = req.body.sex;
	save_data.country = req.body.country;
    module.parent.exports.csvStream.write(save_data); // csvStream is defined in app.js
    console.log('totalEarning = ' + Math.round(parseInt(req.body.totalEarning))/100);
    console.log('bonus_for_waiting = ' + Math.round(parseInt(req.body.bonus_for_waiting))/100);
    console.log('totalPayment = ' + Math.round(10*(parseInt(req.body.bonus_for_waiting)/100 + parseInt(req.body.totalEarning)/100 + 0.80))/10);
    //console.log(save_data);

	res.render('endPage', { 
		title: 'Well done!',
		amazonID: req.body.amazonID,
		bonus_for_waiting: req.body.bonus_for_waiting,
		totalEarning: req.body.totalEarning,
		confirmationID: req.body.confirmationID,
		exp_condition: req.body.exp_condition,
		indivOrGroup: req.body.indivOrGroup,
		q1: req.body.q1,
		q2: req.body.q2,
		q3: req.body.q3,
		q4: req.body.q4,
		age: req.body.age,
		sex: req.body.sex,
		country: req.body.country
	}); 
		// get('/', function()~) you might wonder why '/' rather than 'questionnaire'? 
		// The path would lead the requester to the lower layer '/questionnaire/~'
		// So for example, if you want to have a debug mode, 
		// you can write '/debug' and put a function for debug
	//csvStream = csv.format({headers: true, quoteColumns: true});
    /*csvStream
          .pipe(fs.createWriteStream(path.resolve("./", dataName+'.csv')))
          .on("end", process.exit);*/
});

module.exports = router;
