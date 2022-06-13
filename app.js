'use strict';

// Experimental variables
const flatFeeValue = 0.8 // 1 USD = 0.77 GBP
, completionFeeValue = 0
;

// Loading modules
const createError = require('http-errors')
, express = require('express')
, path = require('path')
, cookieParser = require('cookie-parser')
, logger = require('morgan')
, session = require('express-session')
, bodyParser = require("body-parser")
, csv = require("fast-csv")
, fs = require('fs')
, app = express()
, browser = require('browser-detect')
//, server = require('http').Server(app)
//, io = require('socket.io')(server)
;

// Start csv recording
let myD = new Date()
, myYear = myD.getFullYear()
, myMonth = myD.getMonth() + 1
, myDate = myD.getUTCDate()
, myHour = myD.getUTCHours()
, myMin = myD.getUTCMinutes()
;
if(myMonth<10){myMonth = '0'+myMonth;}
if(myDate<10){myDate = '0'+myDate;}
if(myHour<10){myHour = '0'+myHour;}
if(myMin<10){myMin = '0'+myMin;}

var csvStream
, dataName = "Test"+'_riskyBandit_'+myYear+myMonth+myDate+myHour+myMin
;

csvStream = csv.format({headers: true, quoteColumns: true});
csvStream
      .pipe(fs.createWriteStream(path.resolve("./summaryData/", dataName+'.csv')))
      .on("end", process.exit);

// Routings
const indexRouter = require('./routes/index')
, usersRouter = require('./routes/users')
, helloRouter = require('./routes/hello')
, questionnaireRouter = require('./routes/questionnaire')
, questionnaireForDisconnectedSubjectsRouter = require('./routes/questionnaireForDisconnectedSubjects')
, multipleAccessRouter = require('./routes/multipleAccess')
;

// Making express object
//const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app use
const session_opt = {
  secret: 'baden baden',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 30 * 60 * 1000}
};
app.use(session(session_opt));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Assigning routers to Routing
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/hello', helloRouter);
app.use('/questionnaire', questionnaireRouter);
app.use('/questionnaireForDisconnectedSubjects', questionnaireForDisconnectedSubjectsRouter);
app.use('/multipleAccess', multipleAccessRouter);

app.post('/endPage', function(req, res) {
  let completionFee = flatFeeValue;
  if (req.body.completed == 1) {
    completionFee = flatFeeValue + completionFeeValue;
  }
  let save_data = new Object();
  save_data.date = myYear+myMonth+myDate+myHour+myMin;
  save_data.exp_condition = req.body.exp_condition;
  save_data.indivOrGroup = req.body.indivOrGroup;
  save_data.confirmationID = req.body.confirmationID;
  save_data.amazonID = req.body.amazonID;
  save_data.latency = req.body.latency;
  //save_data.bonus_for_waiting = req.body.bonus_for_waiting;
  //save_data.totalPayment = Math.round((parseInt(req.body.bonus_for_waiting)/100 + parseInt(req.body.totalEarning)/100 + 0.25)*100)/100;
  save_data.totalEarning = parseFloat(req.body.totalEarning).toFixed(2);//Math.round(parseInt(req.body.totalEarning))/100;
  save_data.bonus_for_waiting = Math.round(parseInt(req.body.bonus_for_waiting))/100;
  save_data.completionFee = completionFee;
  save_data.totalPayment = Math.round(10*(parseInt(req.body.bonus_for_waiting)/100 + parseFloat(req.body.totalEarning) + completionFee))/10;
  save_data.age = req.body.age;
  save_data.sex = req.body.sex;
  save_data.country = req.body.country;
  save_data.q1 = req.body.q1;
  save_data.q2 = req.body.q2;
  save_data.q3 = req.body.q3;
  save_data.q4 = req.body.q4;
  csvStream.write(save_data);  // csvStream is defined in app.js
  console.log('totalEarning = ' + Math.round(parseInt(req.body.totalEarning)));
  console.log('bonus_for_waiting = ' + Math.round(parseInt(req.body.bonus_for_waiting))/100);
  console.log('totalPayment = ' + Math.round(10*(parseInt(req.body.bonus_for_waiting)/100 + parseFloat(req.body.totalEarning) + completionFee))/10);
  //console.log(save_data);
  //console.log('save_data is: ');
  //console.log(save_data);

  res.render('endPage', { 
    title: 'Well done!',
    amazonID: req.body.amazonID,
    bonus_for_waiting: req.body.bonus_for_waiting,
    completionFee: completionFee,
    totalEarning: req.body.totalEarning,
    confirmationID: req.body.confirmationID,
    exp_condition: req.body.exp_condition,
    indivOrGroup: req.body.indivOrGroup,
    latency: req.body.latency,
    age: req.body.age,
    sex: req.body.sex,
    country: req.body.country,
    q1: req.body.q1,
    q2: req.body.q2,
    q3: req.body.q3,
    q4: req.body.q4
  }); 
});
app.get('/endPage', function(req, res) {
  res.redirect('https://www.prolific.co/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
