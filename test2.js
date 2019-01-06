'use strict';

const Promise = require('./index');

const p1 = new Promise((resolve, reject) => {
    resolve('hello');
})
.then(result => result)
.catch(e => e);
  
const p2 = new Promise((resolve, reject) => {
    // throw new Error('报错了');
    resolve('world');
})
.then(result => result)
.catch(e => e);
  
Promise.all([p1, p2, 1])
    .then(result => console.log('promise.all result:', result))
    .catch(e => console.log(e));

Promise.race([p1, p2, 1])
    .then(result => console.log('promise.race result:', result))
    .catch(e => console.log(e));
