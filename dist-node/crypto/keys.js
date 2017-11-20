'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAddressAndPublicKeyFromSecret = exports.getKeys = exports.getPrivateAndPublicKeyFromSecret = exports.getPrivateAndPublicKeyBytesFromSecret = undefined;

var _convert = require('./convert');

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @method getPrivateAndPublicKeyBytesFromSecret
 * @param secret
 *
 * @return {object}
 */

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
var getPrivateAndPublicKeyBytesFromSecret = exports.getPrivateAndPublicKeyBytesFromSecret = function getPrivateAndPublicKeyBytesFromSecret(secret) {
  var hashed = (0, _hash2.default)(secret, 'utf8');

  var _naclInstance$crypto_ = naclInstance.crypto_sign_seed_keypair(hashed),
      signSk = _naclInstance$crypto_.signSk,
      signPk = _naclInstance$crypto_.signPk;

  return {
    privateKey: signSk,
    publicKey: signPk
  };
};

/**
 * @method getPrivateAndPublicKeyFromSecret
 * @param secret
 *
 * @return {object}
 */

var getPrivateAndPublicKeyFromSecret = exports.getPrivateAndPublicKeyFromSecret = function getPrivateAndPublicKeyFromSecret(secret) {
  var _getPrivateAndPublicK = getPrivateAndPublicKeyBytesFromSecret(secret),
      privateKey = _getPrivateAndPublicK.privateKey,
      publicKey = _getPrivateAndPublicK.publicKey;

  return {
    privateKey: (0, _convert.bufferToHex)(privateKey),
    publicKey: (0, _convert.bufferToHex)(publicKey)
  };
};

/**
 * @method getKeys
 * @param secret string
 *
 * @return {object}
 */

var getKeys = exports.getKeys = getPrivateAndPublicKeyFromSecret;

/**
 * @method getAddressAndPublicKeyFromSecret
 * @param secret
 *
 * @return {object}
 */

var getAddressAndPublicKeyFromSecret = exports.getAddressAndPublicKeyFromSecret = function getAddressAndPublicKeyFromSecret(secret) {
  var accountKeys = getKeys(secret);
  var accountAddress = (0, _convert.getAddress)(accountKeys.publicKey);

  return {
    address: accountAddress,
    publicKey: accountKeys.publicKey
  };
};