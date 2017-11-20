'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.decryptPassphraseWithPassword = exports.encryptPassphraseWithPassword = exports.decryptMessageWithSecret = exports.encryptMessageWithSecret = exports.verifyData = exports.signData = exports.signAndPrintMessage = exports.printSignedMessage = exports.verifyMessageWithTwoPublicKeys = exports.signMessageWithTwoSecrets = exports.verifyMessageWithPublicKey = exports.signMessageWithSecret = undefined;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _convert = require('./convert');

var _hash = require('./hash');

var _hash2 = _interopRequireDefault(_hash);

var _keys = require('./keys');

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
var createHeader = function createHeader(text) {
	return '-----' + text + '-----';
};
var signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
var messageHeader = createHeader('MESSAGE');
var publicKeyHeader = createHeader('PUBLIC KEY');
var secondPublicKeyHeader = createHeader('SECOND PUBLIC KEY');
var signatureHeader = createHeader('SIGNATURE');
var secondSignatureHeader = createHeader('SECOND SIGNATURE');
var signatureFooter = createHeader('END LISK SIGNED MESSAGE');

/**
 * @method signMessageWithSecret
 * @param message - utf8
 * @param secret - utf8
 *
 * @return {Object} - message, publicKey, signature
 */

var signMessageWithSecret = exports.signMessageWithSecret = function signMessageWithSecret(message, secret) {
	var msgBytes = Buffer.from(message, 'utf8');

	var _getPrivateAndPublicK = (0, _keys.getPrivateAndPublicKeyBytesFromSecret)(secret),
	    privateKey = _getPrivateAndPublicK.privateKey,
	    publicKey = _getPrivateAndPublicK.publicKey;

	var signature = naclInstance.crypto_sign_detached(msgBytes, privateKey);

	return {
		message: message,
		publicKey: (0, _convert.bufferToHex)(publicKey),
		signature: Buffer.from(signature).toString('base64')
	};
};

/**
 * @method verifyMessageWithPublicKey
 * @param {Object} Object - Object
 * @param {String} Object.message - message in utf8
 * @param {String} Object.signature - signature in base64
 * @param {String} Object.publicKey - publicKey in hex
 *
 * @return {string}
 */

var verifyMessageWithPublicKey = exports.verifyMessageWithPublicKey = function verifyMessageWithPublicKey(_ref) {
	var message = _ref.message,
	    signature = _ref.signature,
	    publicKey = _ref.publicKey;

	var msgBytes = Buffer.from(message);
	var signatureBytes = Buffer.from(signature, 'base64');
	var publicKeyBytes = (0, _convert.hexToBuffer)(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid signature length, expected 64-byte signature');
	}

	return naclInstance.crypto_sign_verify_detached(signatureBytes, msgBytes, publicKeyBytes);
};

/**
 * @method signMessageWithTwoSecrets
 * @param message - utf8
 * @param secret - utf8
 * @param secondSecret - utf8
 *
 * @return {Object} - message, publicKey, secondPublicKey, signature, secondSignature
 */

var signMessageWithTwoSecrets = exports.signMessageWithTwoSecrets = function signMessageWithTwoSecrets(message, secret, secondSecret) {
	var msgBytes = Buffer.from(message, 'utf8');
	var keypairBytes = (0, _keys.getPrivateAndPublicKeyBytesFromSecret)(secret);
	var secondKeypairBytes = (0, _keys.getPrivateAndPublicKeyBytesFromSecret)(secondSecret);

	var signature = naclInstance.crypto_sign_detached(msgBytes, keypairBytes.privateKey);
	var secondSignature = naclInstance.crypto_sign_detached(msgBytes, secondKeypairBytes.privateKey);

	return {
		message: message,
		publicKey: (0, _convert.bufferToHex)(keypairBytes.publicKey),
		secondPublicKey: (0, _convert.bufferToHex)(secondKeypairBytes.publicKey),
		signature: Buffer.from(signature).toString('base64'),
		secondSignature: Buffer.from(secondSignature).toString('base64')
	};
};

/**
 * @method verifyMessageWithTwoPublicKeys
 * @param signedMessage
 * @param publicKey
 * @param secondPublicKey
 *
 * @return {string}
 */

var verifyMessageWithTwoPublicKeys = exports.verifyMessageWithTwoPublicKeys = function verifyMessageWithTwoPublicKeys(_ref2) {
	var message = _ref2.message,
	    signature = _ref2.signature,
	    secondSignature = _ref2.secondSignature,
	    publicKey = _ref2.publicKey,
	    secondPublicKey = _ref2.secondPublicKey;

	var messageBytes = Buffer.from(message);
	var signatureBytes = Buffer.from(signature, 'base64');
	var secondSignatureBytes = Buffer.from(secondSignature, 'base64');
	var publicKeyBytes = Buffer.from((0, _convert.hexToBuffer)(publicKey));
	var secondPublicKeyBytes = Buffer.from((0, _convert.hexToBuffer)(secondPublicKey));

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid first signature length, expected 64-byte signature');
	}

	if (secondSignatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid second signature length, expected 64-byte signature');
	}

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	var verifyFirstSignature = function verifyFirstSignature() {
		return naclInstance.crypto_sign_verify_detached(signatureBytes, messageBytes, publicKeyBytes);
	};
	var verifySecondSignature = function verifySecondSignature() {
		return naclInstance.crypto_sign_verify_detached(secondSignatureBytes, messageBytes, secondPublicKeyBytes);
	};

	return verifyFirstSignature() && verifySecondSignature();
};

/**
 * @method printSignedMessage
 * @param {object}
 * @return {string}
 */

var printSignedMessage = exports.printSignedMessage = function printSignedMessage(_ref3) {
	var message = _ref3.message,
	    signature = _ref3.signature,
	    publicKey = _ref3.publicKey,
	    secondSignature = _ref3.secondSignature,
	    secondPublicKey = _ref3.secondPublicKey;
	return [signedMessageHeader, messageHeader, message, publicKeyHeader, publicKey, secondPublicKey ? secondPublicKeyHeader : null, secondPublicKey, signatureHeader, signature, secondSignature ? secondSignatureHeader : null, secondSignature, signatureFooter].filter(Boolean).join('\n');
};

/**
 * @method signAndPrintMessage
 * @param message
 * @param secret
 * @param secondSecret
 *
 * @return {string}
 */

var signAndPrintMessage = exports.signAndPrintMessage = function signAndPrintMessage(message, secret, secondSecret) {
	var signedMessage = secondSecret ? signMessageWithTwoSecrets(message, secret, secondSecret) : signMessageWithSecret(message, secret);

	return printSignedMessage(signedMessage);
};

/**
 * @method signData
 * @param data Buffer
 * @param secret string
 *
 * @return {string}
 */

var signData = exports.signData = function signData(data, secret) {
	var _getPrivateAndPublicK2 = (0, _keys.getPrivateAndPublicKeyBytesFromSecret)(secret),
	    privateKey = _getPrivateAndPublicK2.privateKey;

	var signature = naclInstance.crypto_sign_detached(data, privateKey);
	return (0, _convert.bufferToHex)(signature);
};

/**
 * @method verifyData
 * @param data Buffer
 * @param secondPublicKey
 *
 * @return {boolean}
 */

var verifyData = exports.verifyData = function verifyData(data, signature, publicKey) {
	return naclInstance.crypto_sign_verify_detached((0, _convert.hexToBuffer)(signature), data, (0, _convert.hexToBuffer)(publicKey));
};

/**
 * @method encryptMessageWithSecret
 * @param message
 * @param secret
 * @param recipientPublicKey
 *
 * @return {object}
 */

var encryptMessageWithSecret = exports.encryptMessageWithSecret = function encryptMessageWithSecret(message, secret, recipientPublicKey) {
	var senderPrivateKeyBytes = (0, _keys.getPrivateAndPublicKeyBytesFromSecret)(secret).privateKey;
	var convertedPrivateKey = (0, _convert.convertPrivateKeyEd2Curve)(senderPrivateKeyBytes);
	var recipientPublicKeyBytes = (0, _convert.hexToBuffer)(recipientPublicKey);
	var convertedPublicKey = (0, _convert.convertPublicKeyEd2Curve)(recipientPublicKeyBytes);
	var messageInBytes = naclInstance.encode_utf8(message);

	var nonce = naclInstance.crypto_box_random_nonce();
	var cipherBytes = naclInstance.crypto_box(messageInBytes, nonce, convertedPublicKey, convertedPrivateKey);

	var nonceHex = (0, _convert.bufferToHex)(nonce);
	var encryptedMessage = (0, _convert.bufferToHex)(cipherBytes);

	return {
		nonce: nonceHex,
		encryptedMessage: encryptedMessage
	};
};

/**
 * @method decryptMessageWithSecret
 * @param cipherHex
 * @param nonce
 * @param secret
 * @param senderPublicKey
 *
 * @return {string}
 */

var decryptMessageWithSecret = exports.decryptMessageWithSecret = function decryptMessageWithSecret(cipherHex, nonce, secret, senderPublicKey) {
	var recipientPrivateKeyBytes = (0, _keys.getPrivateAndPublicKeyBytesFromSecret)(secret).privateKey;
	var convertedPrivateKey = (0, _convert.convertPrivateKeyEd2Curve)(recipientPrivateKeyBytes);
	var senderPublicKeyBytes = (0, _convert.hexToBuffer)(senderPublicKey);
	var convertedPublicKey = (0, _convert.convertPublicKeyEd2Curve)(senderPublicKeyBytes);
	var cipherBytes = (0, _convert.hexToBuffer)(cipherHex);
	var nonceBytes = (0, _convert.hexToBuffer)(nonce);

	var decoded = naclInstance.crypto_box_open(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);

	return naclInstance.decode_utf8(decoded);
};

/**
 * @method encryptAES256CBCWithPassword
 * @param {String} plainText utf8 - any utf8 string
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {Object} - { cipher: '...', iv: '...' }
 */

var encryptAES256CBCWithPassword = function encryptAES256CBCWithPassword(plainText, password) {
	var iv = _crypto2.default.randomBytes(16);
	var passwordHash = (0, _hash2.default)(password, 'utf8');
	var cipher = _crypto2.default.createCipheriv('aes-256-cbc', passwordHash, iv);
	var firstBlock = cipher.update(plainText, 'utf8');
	var encrypted = Buffer.concat([firstBlock, cipher.final()]);

	return {
		cipher: encrypted.toString('hex'),
		iv: iv.toString('hex')
	};
};

/**
 * @method decryptAES256CBCWithPassword
 * @param {Object} Object - Object with cipher and iv as hex strings
 * @param {String} Object.cipher - hex string AES-256-CBC cipher
 * @param {String} Object.iv - hex string for the initialisation vector
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {String} utf8
 */

var decryptAES256CBCWithPassword = function decryptAES256CBCWithPassword(_ref4, password) {
	var cipher = _ref4.cipher,
	    iv = _ref4.iv;

	var passwordHash = (0, _hash2.default)(password, 'utf8');
	var decipherInit = _crypto2.default.createDecipheriv('aes-256-cbc', passwordHash, (0, _convert.hexToBuffer)(iv));
	var firstBlock = decipherInit.update((0, _convert.hexToBuffer)(cipher));
	var decrypted = Buffer.concat([firstBlock, decipherInit.final()]);

	return decrypted.toString();
};

/**
 * @method encryptPassphraseWithPassword
 * @param {String} passphrase utf8 - twelve word secret passphrase
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {Object} - { cipher: '...', iv: '...' }
 */

var encryptPassphraseWithPassword = exports.encryptPassphraseWithPassword = encryptAES256CBCWithPassword;

/**
 * @method decryptPassphraseWithPassword
 * @param {Object} cipherAndIv - Object containing the encryption cipher and the iv
 * @param {String} password utf8 - the password used to encrypt the passphrase
 *
 * @return {String}
 */

var decryptPassphraseWithPassword = exports.decryptPassphraseWithPassword = decryptAES256CBCWithPassword;