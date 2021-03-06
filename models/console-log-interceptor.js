'use strict';

const mongoose = require( 'mongoose' );
const Log = require('./log.js');
const dbName = 'mongodb://127.0.0.1/loggingtutorial';
mongoose.connect(dbName, {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
    let now = new Date()
    , logtxt = '[' + now.getUTCFullYear() + '/' + (now.getUTCMonth() + 1) + '/'
    ;
    logtxt += now.getUTCDate() + '/' + now.getUTCHours() + ':' + now.getUTCMinutes() + ':' + now.getUTCSeconds() + ']';
    logtxt += " - Connected successfully to 'loggingtutorial";
    console.log(logtxt);
  });

// https://gist.github.com/pguillory/729616
function hook_stdout(callback) {
  process.stdout.write = (function (write) {
    return function (string) {
      write.apply(process.stdout, arguments)
      callback(string)
    }
  })(process.stdout.write)  
}

function logToDb(log) {
  Log.create(log)
  .exec()
  .catch((e) => {
    console.error(e);
  })
}

function extractTags(str){  
  let tags = str.split(' ').filter(v => v.startsWith('#'));  
  tags = tags.length ? tags.map((t) => t.toLowerCase()) : null;
  return tags;
}

module.exports = function (serverName) {
  const serverNameTag = serverName? `#${serverName}` : '';
  hook_stdout(function (str) {
    let text = ` ${str.trim()} ${serverNameTag}` //add empty space at the start so that first hash tag can be extracted if present
    const log = {
      text,
      tags: extractTags(text)
    }
    logToDb(log);
  })
}
