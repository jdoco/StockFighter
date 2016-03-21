# StockFighter
My attempt at solving Making Amends, StockFighter v1's last level

## First few levels
I beat the first five levels manually in the browser, by playing market maker. I wasn't intending to do it all manually, but once I got going it turned into a bit of a personal challenge. Maybe everyone does that; I'm not sure. Either way, it was a fun experience! 

## High-level approach
For this last level, I realized pretty quickly I wouldn't be able to solve it manually, since I needed information about other accounts. I set up calls to each API to see what information I could glean, and I realized pretty quickly that DeleteOrder leaks account names. I had already noticed that the WebSocket API wasn't protected, since the docs make this abundantly clear, so between those two I had enough to pull all filled orders for every account on the exchange.

Once I had that coded up, I had to analyze the output. The first thing I tried was dropping the ticker tape into Excel just to graph what the price history looked like. I thought there might be obvious spikes and that I could then look for trades right around those spikes. The price looked relatively stable overall, though, so I next got into analyzing each account's trades.

The first two things I chose to analyze were prices and timings -- who was making the most profitable trades, and at what frequency were they making them? This turned out to be sufficient to solve the problem. I had planned to correlate the ticker tape with each account's trades to get a more "traditional" insider trading insight -- who was buying/selling right before prices went up/down? But going that deep wasn't ultimately necessary.

## Code structure
I wrote all the code myself because I wanted to learn ES6 and because I didn't want to expose myself to potential spoilers/hints.

Here are the most important files:
- [StockFighterExchange](StockFighterExchange.js) wraps the StockFighter API, with [ExchangeClient](ExchangeClient.js) abstracing away some of the low-level HTTP stuff.
- [log_trades](log_trades.js) builds up a set of accounts and hooks up a WebSocket to each one to log its trades
- [analyze_prices](analyze_prices.js) builds up some basic pricing analysis using the logged trades and spits it out into [analysis/prices.txt](analysis/prices.txt)
- [analyze_trade_times](analyze_trade_times.js) does some basic trade timing analysis (average time between trades, max time between trades, etc.) and writes to [analysis/times.txt](analysis/times.txt)

## Analysis
After about 25 minutes, I ran analyze_prices and analyze_trade_times and then inspected the files manually. Basically I'm looking for an account that has high profits (I use average price as a proxy for profits that worked well enough, but actually calculating profits would have been better, for example by assigning the existing price to any outstanding stocks to get a real 'position'), and that trades with interesting timings. 

There appear to be a few clear clusters of bots that the insider doesn't fit into:
-The HFT bots are all obviously the ones with super low average times between trades and very high trade volumes. 
-There are some bots which only ever buy, and do so infrequently. Not sure why; maybe they are Buffett bots? 
-There are some bots which buy and sell relatively frequently but *suck* at it; I'm guessing those are daytraderbots.
