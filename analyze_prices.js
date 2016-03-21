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

  let quantityOwned = 0;
  let balance = 0;
  let buyCount = 0;
  let sellCount = 0;
  let buyQuantity = 0;
  let sellQuantity = 0;

  rd.on('line', line => {
    const order = JSON.parse(line).order;
    
    let buy = order.direction === 'buy';
    let direction = 1;
    if (buy) {
      buyCount++;
    } else {
      sellCount++;
      direction = -1;
    }

    const fills = order.fills;

    fills.forEach(fill => {
      quantityOwned += fill.qty * direction;
      balance -= fill.qty * fill.price * direction;
      if (buy) {
        buyQuantity += fill.qty;
      } else {
        sellQuantity += fill.qty;
      }
    });
  });

  rd.on('close', () => {
    if (sellCount > 0)
      accounts.push({filename, avgPrice: Math.abs(balance/100/quantityOwned), quantityOwned, balance: balance/100, buyCount, sellCount, buyQuantity, sellQuantity});
  });
});

setTimeout(() => {
  accounts.sort((a,b) => b.avgPrice - a.avgPrice);
  accounts.forEach(e => fs.appendFileSync('./analysis/prices.txt', `${JSON.stringify(e)}${os.EOL}`));
}, 5000);