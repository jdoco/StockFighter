'use strict';

const fs = require('fs');
const readline = require('readline');
const os = require('os');

const files = fs.readdirSync('./logs/orders');

let accounts = [];

files.forEach(filename => {

  const rd = readline.createInterface({
    input: fs.createReadStream(`./logs/orders/${filename}`),
    output: process.stdout,
    terminal: false
  });

  let timestamps = []

  rd.on('line', line => {
    const order = JSON.parse(line).order;
    timestamps.push(new Date(order.ts));
  });

  let gaps = [];
  rd.on('close', () => {
    timestamps.sort((a,b) => a - b);
    
    timestamps.forEach((ts, i, arr) => {
      if (i === 0)
        return;
      let gap = arr[i] - arr[i-1];
      gaps.push(gap);
    });
    
    if (gaps.length > 1) {
      const avgGap = gaps.reduce((a,b) => a + b)/gaps.length;
      const maxGap = Math.max(...gaps);
      const minGap = Math.min(...gaps);
      
      accounts.push({filename, avgGap, maxGap, minGap});
    }
  });
});

setTimeout(() => {
  accounts.sort((a,b) => b.avgGap - a.avgGap);
  accounts.forEach(e => fs.appendFileSync('./analysis/trade_times.txt', `${JSON.stringify(e)}${os.EOL}`));
}, 5000);