const URI = require('url');
const http = require('http');
const https = require('https');
const Stream = require('stream');
const {debuglog} = require('util');
const querystring = require('querystring');

const debug = debuglog('xttp');

/**
 * Xttp
 * @param {*} url 
 * @param {*} params 
 * @param {*} fn 
 */
function Xttp(url, params, fn) {
  const request = new Xttp.Request(url, params);
  fn && request.end(fn);
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
    headers: {},
    middleware: []
  }, params);
};
/**
 * use
 * @param {*} mw 
 */
Xttp.Request.prototype.use = function(mw){
  if(typeof mw !== 'function')
    throw new TypeError(`[xttp] middleware must be a function`);
  this.middleware.push(mw);
  return this;
};

[ 'get', 'post', 'put', 'delete' ].forEach(method => {
  Xttp[method] = function(url, params, fn){
    return Xttp.create(url, Object.assign({
      method
    }, params), fn);
  };
  Xttp.Request.prototype[method] = function(url){
    this.method = method;
    return Object.assign(this, URI.parse(url, true));
  };
});

function setQuery(name, value){
  this._query = this._query || {};
  if(typeof name === 'object'){
    Object.assign(this._query, name);
  }else{
    this._query[name] = value;
  }
  const qs = querystring.stringify(this._query);
  this.path = `${this.pathname}?${qs}`;
  return this;
};

Xttp.Request.prototype.__defineSetter__('query', setQuery);
Xttp.Request.prototype.__defineGetter__('query', function(){
  return Object.assign(setQuery.bind(this), this._query);
});
/**
 * header
 * @param {*} key 
 * @param {*} value 
 */
Xttp.Request.prototype.header = function(key, value){
  if(typeof key === 'object'){
    Object.assign(this.headers, key);
  }else{
    this.headers[key] = value;
  }
  return this;
};
/**
 * type
 * @param {*} contentType 
 */
Xttp.Request.prototype.type = function(contentType){
  return this.header('content-type', {
    'json': 'application/json',
    'form': 'application/x-www-form-urlencoded',
    'urlencoded': 'application/x-www-form-urlencoded',
  }[contentType] || contentType);
};

Xttp.Request.prototype.send = function(body){
  this.body = body;
  return this;
};

Xttp.Request.prototype.json = function(body){
  return this.type('json').send(body);
};

Xttp.Request.prototype.getHeader = function(name){
  for(const k in this.headers){
    if(k.toLowerCase() === name.toLowerCase())
      return this.headers[k];
  }
};

Xttp.Serializers = {
  'application/json': JSON.stringify,
  'application/x-www-form-urlencoded': querystring.stringify
};

Xttp.Request.prototype.getBody = function(){
  let { body } = this;
  let contentType = this.getHeader('content-type');
  if(!contentType) contentType = 'application/x-www-form-urlencoded';
  const serializer = Xttp.Serializers[contentType];
  if(typeof serializer !== 'function')
    throw new Error(`[xttp] unknow content-type: ${contentType}`);
  body = serializer(body) || '';
  this.header('content-type', contentType);
  this.header('content-length', Buffer.byteLength(body));
  return body; 
};

Xttp.Request.prototype.end = function(){
  const body = this.getBody();
  debug('[xttp] send request:', this);
  return new Promise((response, reject) => {
    const client = this.protocol === 'http:' ? http : https;
    this.req = client.request(this, response);
    this.req.on('error', reject);
    if(body instanceof Stream){
      body.pipe(this.req);
    }else{
      this.req.end(body);
    }
  }).then(res => new Xttp.Response(this, res));
};

Xttp.Response = function(req, res){
  if(!(this instanceof Xttp.Response))
    return new Xttp.Response(req, res);
  this.request = req;
  this.response = res;
  debug('[xttp] response:', this.status, this.headers);
  return this;
};

Xttp.Response.prototype.__defineGetter__('status', function(){
  return this.response.statusCode;
});

Xttp.Response.prototype.__defineGetter__('headers', function(){
  return this.response.headers;
});

Xttp.Response.prototype.pipe = function(stream){
  return this.response.pipe(stream);
};

Xttp.Response.prototype.data = function(){
  if(this._data) return Promise.resolve(this._data);
  return new Promise((resolve, reject) => {
    const buffer = [];
    this.response
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