'use strict';

const request = require('request');
const WebSocketClient = require('websocket').client;

class ExchangeClient {
  constructor(apiKey, domain) {
    this.apiKey = apiKey;
    this.httpBaseUrl = `https://${domain}`;
    this.wsBaseUrl = `wss://${domain}`;
  }
  
  getRequest(path, callback) {
    request(`${this.httpBaseUrl}${path}`, 
      {headers: {'X-Starfighter-Authorization': this.apiKey}}, 
      (error, response, body) => {
        this._handleResponse(error, response, body, callback);
      }
    );  
  }  
  
  postRequest(path, body, callback) {
    request.post(`${this.httpBaseUrl}${path}`, 
      { headers: { 'X-Starfighter-Authorization': this.apiKey }, body: JSON.stringify(body) }, 
      (error, response, body) => {
        this._handleResponse(error, response, body, callback);
      }
    );
  }

  deleteRequest(path, callback) {
    request.del(`${this.httpBaseUrl}${path}`, 
      {headers: {'X-Starfighter-Authorization': this.apiKey}}, 
      (error, response, body) => {
        this._handleResponse(error, response, body, callback);
      }
    );  
  }   
  
  openWebSocket(path, callback) {
    const wsClient = new WebSocketClient();
    wsClient.on('connectFailed', error => {
      throw new Error(error);
    });
     
    wsClient.on('connect', connection => {
      connection.on('error', error => {
        throw new Error(error);
      });
      connection.on('close', () => {
        //console.log('echo-protocol Connection Closed');
      });
      connection.on('message', message => {
        if (message.type === 'utf8') {
          callback(message.utf8Data);
        }
      });
    });

    wsClient.connect(`${this.wsBaseUrl}${path}`, null);
  }  
  
  _handleResponse(error, response, body, callback) {
    if (error) {
      throw new Error(error);
    } else if (response.statusCode === 405) {
      throw new Error(response.statusCode);
    } else {
      callback(JSON.parse(body));
    }  
  }  
}

module.exports = ExchangeClient;