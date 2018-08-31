const URI = require('url');
const http = require('http');
const https = require('https');
/**
 * Xttp
 * @param {*} url 
 * @param {*} params 
 * @param {*} fn 
 */
function Xttp(url, params, fn) {
  const request = new Xttp.Request(url, params);
  request.then(x => fn && fn(null, x), fn);
  return request;
};

/**
 * create
 * @param {*} url 
 * @param {*} params 
 */
Xttp.create = (url, params) => {
  return new Xttp.Request(url, params);
};

/**
 * Request
 * @param {*} url 
 * @param {*} params 
 */
Xttp.Request = function(url, params){
  if(url) this.get(url);
  return Object.assign(this, {
    body: '',
    headers: {}
  }, params);
};

Xttp.Request.prototype.get = function(url){
  return Object.assign(this, URI.parse(url, true));
};

Xttp.Request.prototype.header = function(key, value){
  if(typeof key === 'object'){
    this.headers = key;
  }else{
    this.headers[key] = value;
  }
  return this;
};

Xttp.Request.prototype.send = function(body){
  this.body = body;
  return this;
};

Xttp.Request.prototype.end = function(){
  this.headers['Content-Length'] = Buffer.byteLength(this.body);
  const p = new Promise((response, reject) => {
    const client = this.protocol === 'http:' ? http : https;
    this.req = client.request(this, response);
    this.req.on('error', reject);
    this.req.write(this.body);
    this.req.end();
  });
  return p.then(res => new Xttp.Response(res));
};

Xttp.Response = function(res){
  this.res = res;
  return this;
};

Xttp.Response.prototype.data = function(){
  if(this._data) return Promise.resolve(this._data);
  return new Promise((resolve, reject) => {
    const buffer = [];
    this.res
    .on('error', reject)
    .on('data', chunk => buffer.push(chunk))
    .on('end', () => resolve(this._data = Buffer.concat(buffer)));
  });
};

Xttp.Response.prototype.text = function({ encoding = 'utf8' } = {}){
  return this.data().then(x => x.toString(encoding));
};

Xttp.Response.prototype.json = function(options){
  return this.text(options).then(JSON.parse);
};

Xttp.Request.prototype.then = function(resolve, reject){
  return this.end().then(resolve, reject);
};

module.exports = Xttp;