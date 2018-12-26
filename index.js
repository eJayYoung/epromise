'use strict';

const STATES = { /* 2.1 */
    PENDING: 'pending',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected'
};

function noop() {}

class Promise {
    constructor(executor) {
        this.state = STATES.PENDING;
        this.value = null;
        this.equeue = [];
        if (executor) {
            executor(this.fulfill.bind(this), this.reject.bind(this));
        }
    }
    fulfill(value) { // 2.1.2.2
        this.transition(STATES.FULFILLED, value);
    }
    reject(reason) { // 2.1.3.2
        this.transition(STATES.REJECTED, reason);
    }
    transition(state, result) {
        if (this.state !== STATES.PENDING) { // 2.1.2.1, 2.1.3.1
            return;
        }
        this.state = state; // 2.1.1.1
        this.value = result;

        this.execute();
    }
    then(onFulfilled, onRejected) {
        const promise = new Promise();

        if (typeof onFulfilled !== 'function') {
            onFulfilled = noop; // 2.2.1.1
        }
        if (typeof onRejected !== 'function') {
            onRejected = noop; // 2.2.1.2
        }

        this.equeue.push({
            onFulfilled,
            onRejected,
            promise
        });

        this.execute();

        return promise; // 2.2.7
    }
    execute() {
        let val = this.value,
            fn,
            promiseFn;

        if (this.state === STATES.PENDING) {
            return;
        } else if (this.state === STATES.FULFILLED) {
            fn = 'onFulfilled';
            promiseFn = 'fulfill';
        } else if (this.state === STATES.REJECTED) {
            fn = 'onRejected';
            promiseFn = 'reject';
        }

        setTimeout(() => { // 2.2.4
            while(this.equeue.length) {
                const callbacks = this.equeue.shift(); // 2.2.2.3, 2.2.3.3
                const call = callbacks[fn];
                const promise2 = callbacks.promise;

                if (call === noop) { // 2.2.7.3, 2.2.7.4
                    promise2[promiseFn](val);
                    continue;
                }

                try {
                    const x = call(val);
                    Resolve(promise2, x);
                } catch (e) {
                    promise2.reject(e);
                }
            }
        }, 0)
    }
}

function Resolve(promise, x) {
    if (promise === x) { // 2.3.1
        return promise.reject(new TypeError());
    }
    
    if (x instanceof Promise) {
        return x.then(value => {
            //promise.fulfill(value); // 2.3.2.2
            Resolve(promise, value);
        }, reason => {
            promise.reject(reason); // 2.3.2.3
        })
    }

    if (x && typeof x === 'object' || typeof x === 'function') {
        let then, called = false;
        try {
            then = x.then; // 2.3.3.1
        } catch (e) {
            promise.reject(e); // 2.3.3.2
        }
        
        if (typeof then === 'function') {
            try {
                then.call(x, function resolvePromise(y) {
                    if (called) return;
                    called = true;
                    Resolve(promise, y); // 2.3.3.3.1
                }, function rejectPromise(r) {
                    if (called) return;
                    called = true;
                    promise.reject(r); // 2.3.3.3.2
                })
            } catch (e) {
                if (called) return;
                promise.reject(e); // 2.3.3.3.4.2
            }
        } else {
            promise.fulfill(x);
        }
    } else {
        promise.fulfill(x);
    }
}

module.exports = Promise;