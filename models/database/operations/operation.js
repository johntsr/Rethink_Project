var calls = require('../../callbacks.js');

var model 		= module.exports;
model.Operation = Operation;

function Operation(_table, _callback, _errCallback){
    'use strict';
    if(!_callback){
        _callback = calls.noFun;
    }
    if(!_errCallback){
        _errCallback = calls.throwError;
    }
    this.table = _table;
    this.callback = _callback;
    this.errCallback = _errCallback;
}
