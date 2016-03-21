'use strict';

const fs = require('fs');
const os = require('os');
const StockExchange = require('./StockFighterExchange');
const apiKey = require('./secrets/apiKey');

const venue = "SSTBEX"; 
const stock = "UFEH";
const account = "CES99858242";

const exchange = new StockExchange(apiKey, account, venue, stock);

//
//Sample method calls for exchange
//
//exchange.placeOrder(25000, 10, 'buy', 'limit', console.log);
//exchange.isVenueUp(console.log);
//exchange.getOrderStatus(0, console.log);
//exchange.deleteOrder(0, console.log);
//exchange.deleteOrder(0, console.log);
//exchange.getAllOrders(account, console.log);

//
// This code builds up a set of all account names, then logs all trades for each account found for further analysis
//
let accounts = new Set();

function metaLog(message) {
  fs.appendFileSync('./logs/meta.txt', `${Date.now()}: ${message}${os.EOL}`);
}

function getAccountForNextOrder(id) {
  exchange.deleteOrder(id, res => {
    if(!res.ok && res.error.includes('You have to own account')) {
      //got a leaked account name
      const orderAccount = res.error.substring(res.error.lastIndexOf(' ')+1,res.error.lastIndexOf('.'));
      if (!accounts.has(orderAccount)) {
        accounts.add(orderAccount);
        exchange.streamFills(orderAccount, stock, message => {
          fs.appendFileSync(`./logs/orders/${orderAccount}.txt`, message + os.EOL);
        });
        metaLog(`Account #${accounts.size}: ${orderAccount}`);
      }
      
      //move on to deleting the next order
      setTimeout(() => getAccountForNextOrder(id+1), 0); //gross way to avoid worrying about stack overflow
    } else if (!res.ok && res.error.includes('highest available on this')) {
      //order doesn't exist yet; try again in a bit
      metaLog(`Order ${id} does not exist yet`);
      setTimeout(() => getAccountForNextOrder(id), 1000);
    } else if (!res.ok) {
      metaLog(`WTF: Unexpected error in gAFNO for ID #${id}: ${res.error}`);
    } else {
      //this shouldn't happen :)
      metaLog(`WTF: Deleted an order successfully. ID: ${id}`);
      
      //move on to deleting the next order
      setTimeout(() => getAccountForNextOrder(id+1), 0); //gross way to avoid worrying about stack overflow      
    }
  });
}

getAccountForNextOrder(0);

//Stream all quotes for the exchange. Appears to not really be needed to find the insider.
//exchange.streamQuotes(message => { fs.appendFileSync('./logs/quotes.txt', message + os.EOL); });
