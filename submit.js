'use strict';

const ExchangeClient = require('./ExchangeClient');
const domain = 'api.stockfighter.io'
const apiKey = require('./secrets/apiKey');

const client = new ExchangeClient(apiKey, domain);

const insiderAccount = 'fakeAcct';
const instanceId = 'fakeInstance';

//{ "account" : "ABC123456", "explanation_link": "http://www.example.com", "executive_summary": "Lorem ipsum blah blah blah." }
let body = {
  account: insiderAccount,
  explanation_link: 'https://github.com/jdoco/StockFighter/',
  executive_summary: 
`(Testing... testing...)
I figured out how to leak other account names from the delete order API. Then, since websockets don't have security and can take any account name, I streamed every account's orders into local files.
Once I have logs of all trading activity on the exchange, I analyze these files to figure out who's making a lot of money with anomalous trading patterns.
The insider appears to fairly consistently make the most money per trade, and trade at a very specific (slow) frequency that doesn't match any other trader.
I was going to correlate each account's buys/sells with price swings (i.e. the insider should be trading 'clairvoyantly' prior to price swings), but the above appears to be sufficient.`
};

//Post your evidence to /gm/instances/YOUR_INSTANCE_ID/judge
client.postRequest(`/gm/instances/${instanceId}/judge`, body, console.log); 
