const xttp = require('..');
const test = require('./test');
const assert = require('assert');

test('xttp#request', async () => {
  const res = await xttp('https://httpbin.org/get?a=b');
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.args, { a: 'b' });
  assert.equal(res.contentType, 'application/json');
});

test('xttp#get', async () => {
  const res = await xttp.get('https://httpbin.org/get?a=b');
  assert.equal(res.status, 200);
});

test('xttp#post', async () => {
  const res = await xttp('https://httpbin.org/post', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: '{}'
  });
  assert.equal(res.status, 200);
});

test('xttp#get with query', async () => {
  const res = await xttp('https://httpbin.org/get?a=b', {
    method: 'get',
    query: { c: 'd' },
    headers: {
      'User-Agent': 'xttp/1.0'
    }
  });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body.args, { a: 'b', c: 'd' });
});

test('xttp#create', async () => {
  const res = await xttp
  .create({
    url: 'aaa',
    query: { a: 'b' }
  })
  .header('foo', 'bar')
  .post('https://httpbin.org/post?e=f')
  .query('c', 'd')
  .query({ g: 'h' })
  .json({ name: 'xttp' });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body.args, { a: 'b', c: 'd', e: 'f', g: 'h' });

});