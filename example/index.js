const xttp = require('..');

// xttp
//   .get('https://httpbin.org/get?a=b')
//   .then(res => res.json())
//   .then(res => console.log(res));

// // // case 1:
// xttp('https://api.github.com/users/song940/orgs', {
//   method: 'get',  
//   headers: {
//     'User-Agent': 'xttp/1.0'
//   }
// }, async (err, res) => {
//   const data = await res.json();
//   console.log(err, data);
// });

// // case 2:
// xttp('https://httpbin.org/get?a=b', {
//   method: 'get',
//   query: { c: 'd' },
//   headers: {
//     'User-Agent': 'xttp/1.0'
//   }
// })
// .then(res => res.json())
// .then(res => {
//   console.log(res);
// });

// case 3:
xttp
.create({
  url: 'aaa',
  query: { a: 'b' }
})
.post('https://httpbin.org/post?e=f')
.query('c', 'd')
.query({ g: 'h' })
.json({ name: 'xttp' })
.then(res => res.json())
.then(res => {
  console.log(res);
});