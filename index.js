const URI = require('url');
const http = require('http');
const https = require('https');
const querystring = require('querystring');
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
  if(typeof url === 'object'){
    params = url;
    url = params.url;
  }
  if(typeof url === 'string') 
    this.get(url);
  return Object.assign(this, {
    body: '',
    headers: {}
  }, params);
};

Xttp.Request.prototype.get = function(url){
  return Object.assign(this, URI.parse(url, true));
};

Xttp.Request.prototype.post = function(url){
  this.method = 'POST';
  return Object.assign(this, URI.parse(url, true));
};

function setQuery(name, value){
  if(typeof name === 'object'){
    this._query = Object.assign({}, this._query, name);
  }else{
    this._query[name] = value;
  }
  this.path = this.pathname+'?'+querystring.stringify(this._query);
  return this;
};

Xttp.Request.prototype.__defineSetter__('query', setQuery);
Xttp.Request.prototype.__defineGetter__('query', function(){
  return Object.assign(setQuery.bind(this), this._query);
});

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

Xttp.Request.prototype.type = function(contentType){
  return this.header('content-type', {
    'form': 'application/x-www-form-urlencoded',
    'urlencoded': 'application/x-www-form-urlencoded',
  }[contentType] || contentType);
};

Xttp.Request.prototype.json = function(body){
  this.headers['content-type'] = 'application/json';
  return this.send(body);
};

Xttp.Request.prototype.getBody = function(){
  let { body } = this;
  let contentType = this.headers['content-type'];
  if(!contentType) contentType = 'application/json';
  switch(contentType){
    case 'application/json':
      body = JSON.stringify(body);
      break;
    case 'application/x-www-form-urlencoded':
      body = querystring.stringify(body);
      break;
    case 'multipart/form-data':
      console.warn('[xttp] multipart/form-data', body);
      break;
    default:
      console.warn('[xttp] unknow content-type:', contentType);
      break;
  }
  this.header('content-type', contentType);
  this.header('content-length', Buffer.byteLength(body));
  return body;
};

Xttp.Request.prototype.end = function(){
  const body = this.getBody();
  const p = new Promise((response, reject) => {
    const client = this.protocol === 'http:' ? http : https;
    this.req = client.request(this, response);
    this.req.on('error', reject);
    this.req.write(body);
    this.req.end();
  });
  return p.then(res => new Xttp.Response(res));
};

Xttp.Response = function(res){
  this.res = res;
  return this;
};

Xttp.Response.prototype.pipe = function(stream){
  return this.res.pipe(stream);
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