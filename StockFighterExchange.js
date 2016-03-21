'use strict';

const ExchangeClient = require('./ExchangeClient');

const domain = 'api.stockfighter.io'

class StockFighterExchange {
  constructor(apiKey, account, venue, stock) {
    this.client = new ExchangeClient(apiKey, domain);
    
    this.account = account;
    this.venue = venue;
    this.stock = stock;
  }
  
  isVenueUp(callback) {
    this.client.getRequest(`/ob/api/venues/${this.venue}/stocks`, callback);
  }

  placeOrder(price, quantity, direction, orderType, callback) {
    const order = {
      account: this.account,
      venue: this.venue,
      stock: this.stock,
      price,
      qty: quantity,
      direction,
      orderType
    };
    
    this.client.postRequest(`/ob/api/venues/${this.venue}/stocks/${this.stock}/orders`, order, callback);
  }
  
  getOrderStatus(id, callback) {
    this.client.getRequest(`/ob/api/venues/${this.venue}/stocks/${this.stock}/orders/${id}`, callback);
  }
  
  getAllOrders(account, callback) {
    this.client.getRequest(`/ob/api/venues/${this.venue}/accounts/${account}/orders/`, callback);
  }
  
  deleteOrder(id, callback) {
    this.client.deleteRequest(`/ob/api/venues/${this.venue}/stocks/${this.stock}/orders/${id}`, callback);
  }
  
  streamFills(account, stock, callback) {
    const acc = account || this.account;
    const stockPostfix = stock ? `/stocks/${stock}` : '';
    
    this.client.openWebSocket(`/ob/api/ws/${acc}/venues/${this.venue}/executions${stockPostfix}`, callback);
  }
  
  streamQuotes(callback) {
    this.client.openWebSocket(`/ob/api/ws/${this.account}/venues/${this.venue}/tickertape`, callback);
  }
}

module.exports = StockFighterExchange;
