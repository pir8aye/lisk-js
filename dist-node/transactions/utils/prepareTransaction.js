'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _signAndVerify = require('./signAndVerify');

var _getTransactionId = require('./getTransactionId');

var _getTransactionId2 = _interopRequireDefault(_getTransactionId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright © 2017 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
var secondSignTransaction = function secondSignTransaction(transactionObject, secondSecret) {
	return (0, _assign2.default)({}, transactionObject, {
		signSignature: (0, _signAndVerify.signTransaction)(transactionObject, secondSecret)
	});
};

var prepareTransaction = function prepareTransaction(transaction, secret, secondSecret) {
	var singleSignedTransaction = (0, _assign2.default)({}, transaction, {
		signature: (0, _signAndVerify.signTransaction)(transaction, secret)
	});

	var signedTransaction = typeof secondSecret === 'string' && transaction.type !== 1 ? secondSignTransaction(singleSignedTransaction, secondSecret) : singleSignedTransaction;

	var transactionWithId = (0, _assign2.default)({}, signedTransaction, {
		id: (0, _getTransactionId2.default)(signedTransaction)
	});

	return transactionWithId;
};

exports.default = prepareTransaction;