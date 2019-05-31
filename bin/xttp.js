#!/usr/bin/env node

const xttp = require('..');
const http = require('http');

const [method, url] = process.argv.slice(2);

function color(str, c){
  return "\x1b[" + c + "m" + str + "\x1b[0m";
};

const header = res => {
  const { httpVersion } = res.response;
  const { status, statusText } = res;
  console.log(color(`HTTP/${httpVersion} ${status} ${statusText}`, 32));
  Object.keys(res.headers).forEach(header => {
    console.log(`${color(header, 36)}: ${res.headers[header]}`);
  });
  return res.auto();
};

const response = body => {
  console.log();
  console.log(body);
};

xttp({
  method,
  url
})
.then(header)
.then(response)
.catch(err => console.error(err))