'use strict';

/*
  this file is used to generate a CSV to drop into Excel to look at trade history quickly
  it wasn't ultimately needed in the final solution
*/

const fs = require('fs');
const readline = require('readline');
const json2csv = require('json2csv');

var rd = readline.createInterface({
    input: fs.createReadStream('./logs/quotes.txt'),
    output: process.stdout,
    terminal: false
});

const fields = ['last', 'lastTrade', 'lastSize'];

let json = [];
//{"ok":true,"quote":{"symbol":"HEH","venue":"HGMEX","bid":2413,"ask":2425,"bidSize":16182,"askSize":29019,"bidDepth":138888,"askDepth":116329,"last":2425,"lastSize":836,"lastTrade":"2016-03-20T12:09:22.285874659Z","quoteTime":"2016-03-20T12:09:22.28594525Z"}}
rd.on('line', line => {
  let quote = JSON.parse(line).quote;
  json.push(quote);
});


rd.on('close', () => {
  json.sort((a, b) => new Date(a.lastTrade) - new Date(b.lastTrade));
  json2csv({ data: json, fields: fields }, function(err, csv) {
    if (err) console.log(err);
    fs.writeFile('./logs/quotes.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  });
});