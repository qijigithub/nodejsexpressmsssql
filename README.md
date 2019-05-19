# nodejs express msssql

* framework: node.js express

## install
### Install the Express Generator
```
$ npm install -g express-generator
```
* use expres --version check version number
* create file call express-demo
```
$ express -e express-demo
$ cd express demo
$ npm install
$ npm start
```
* check express start page on http://localhost:3000/

## database connect 
install mssql
```
$ npm install massql
```

```
const sql = require('mssql');
const config = {
  user: '',
  password: '',
  server: '',
  database: '',
  connectionTimeout: 1000000,
  requestTimeout: 1000000
};
```
* In index.js template, multiple querys are allowed.
