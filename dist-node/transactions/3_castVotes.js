'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('../crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _constants = require('../constants');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method castVotes
 * @param {Object} Object - Object
 * @param {String} Object.secret
 * @param {Array<String>} Object.delegates
 * @param {String} Object.secondSecret
 * @param {Number} Object.timeOffset
 *
 * @return {Object}
 */

var castVotes = function castVotes(_ref) {
  var secret = _ref.secret,
      delegates = _ref.delegates,
      secondSecret = _ref.secondSecret,
      timeOffset = _ref.timeOffset;

  var keys = _crypto2.default.getKeys(secret);

  var transaction = {
    type: 3,
    amount: '0',
    fee: _constants.VOTE_FEE.toString(),
    recipientId: _crypto2.default.getAddress(keys.publicKey),
    senderPublicKey: keys.publicKey,
    timestamp: (0, _utils.getTimeWithOffset)(timeOffset),
    asset: {
      votes: delegates
    }
  };

  return (0, _utils.prepareTransaction)(transaction, secret, secondSecret);
}; /*
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
/**
 * Vote module provides functions for creating vote transactions.
 * @class vote
 */
exports.default = castVotes;