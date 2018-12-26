'use strict';

var Promise = require('./index');

var promisesAplusTests = require('promises-aplus-tests');

var adapter = {
    resolved(value) {
      return new Promise((resolve) => {resolve(value)});
    },
    rejected(reason) {
      return new Promise((resolve, reject) => {reject(reason)});
    },
    deferred() {
      let resolve, reject;
      
      return {
        promise: new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
        }),
        resolve,
        reject
      };
    }
  };
  
  promisesAplusTests(adapter, function (err) {
      // All done; output is in the console. Or check `err` for number of failures.
  });
  