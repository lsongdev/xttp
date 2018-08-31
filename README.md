## xttp [![xttp](https://img.shields.io/npm/v/xttp.svg)](https://npmjs.org/xttp)

> simple http client in node js

### Installation

```bash
$ npm install xttp
```

### Example

```js
const xttp = require('xttp');

// case 1:
xttp('https://api.github.com/users/song940/orgs', {
  method: 'get',  
  headers: {
    'User-Agent': 'xttp/1.0'
  }
}, async (err, res) => {
  const data = await res.json();
  console.log(err, data);
});

// case 2:
xttp('https://api.github.com/users/song940/orgs', {
  method: 'get',
  headers: {
    'User-Agent': 'xttp/1.0'
  }
})
.then(res => res.json())
.then(res => {
  console.log(res);
});

// case 3:
xttp
.create()
.get('https://api.github.com/users/song940/orgs')
.header('User-Agent', 'Xttp/0.1')
.then(res => res.json())
.then(res => {
  console.log(res);
});

```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

This work is licensed under the [MIT license](./LICENSE).

---