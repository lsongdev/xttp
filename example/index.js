const xttp = require('..');

// // case 1:
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
// xttp('https://api.github.com/users/song940/orgs', {
//   method: 'get',
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
.create()
.post('https://httpbin.org/post')
.json({ name: 'xttp' })
.then(res => res.json())
.then(res => {
  console.log(res);
});