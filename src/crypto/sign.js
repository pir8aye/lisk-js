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
import { hexToBuffer, bufferToHex } from './convert';
import { getPrivateAndPublicKeyBytesFromSecret } from './keys';

const createHeader = text => `-----${text}-----`;
const signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
const messageHeader = createHeader('MESSAGE');
const publicKeyHeader = createHeader('PUBLIC KEY');
const secondPublicKeyHeader = createHeader('SECOND PUBLIC KEY');
const signatureHeader = createHeader('SIGNATURE');
const secondSignatureHeader = createHeader('SECOND SIGNATURE');
const signatureFooter = createHeader('END LISK SIGNED MESSAGE');

/**
 * @method signMessageWithSecret
 * @param message - utf8
 * @param secret - utf8
 *
 * @return {Object} - message, publicKey, signature
 */

export const signMessageWithSecret = (message, secret) => {
	const msgBytes = Buffer.from(message, 'utf8');
	const { privateKey, publicKey } = getPrivateAndPublicKeyBytesFromSecret(
		secret,
	);
	const signature = naclInstance.crypto_sign_detached(msgBytes, privateKey);

	return {
		message,
		publicKey: bufferToHex(publicKey),
		signature: Buffer.from(signature).toString('base64'),
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

export const verifyMessageWithPublicKey = ({
	message,
	signature,
	publicKey,
}) => {
	const msgBytes = Buffer.from(message);
	const signatureBytes = Buffer.from(signature, 'base64');
	const publicKeyBytes = hexToBuffer(publicKey);

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid publicKey, expected 32-byte publicKey');
	}

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error('Invalid signature length, expected 64-byte signature');
	}

	return naclInstance.crypto_sign_verify_detached(
		signatureBytes,
		msgBytes,
		publicKeyBytes,
	);
};

/**
 * @method signMessageWithTwoSecrets
 * @param message - utf8
 * @param secret - utf8
 * @param secondSecret - utf8
 *
 * @return {Object} - message, publicKey, secondPublicKey, signature, secondSignature
 */

export const signMessageWithTwoSecrets = (message, secret, secondSecret) => {
	const msgBytes = Buffer.from(message, 'utf8');
	const keypairBytes = getPrivateAndPublicKeyBytesFromSecret(secret);
	const secondKeypairBytes = getPrivateAndPublicKeyBytesFromSecret(
		secondSecret,
	);

	const signature = naclInstance.crypto_sign_detached(
		msgBytes,
		keypairBytes.privateKey,
	);
	const secondSignature = naclInstance.crypto_sign_detached(
		msgBytes,
		secondKeypairBytes.privateKey,
	);

	return {
		message,
		publicKey: bufferToHex(keypairBytes.publicKey),
		secondPublicKey: bufferToHex(secondKeypairBytes.publicKey),
		signature: Buffer.from(signature).toString('base64'),
		secondSignature: Buffer.from(secondSignature).toString('base64'),
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

export const verifyMessageWithTwoPublicKeys = ({
	message,
	signature,
	secondSignature,
	publicKey,
	secondPublicKey,
}) => {
	const messageBytes = Buffer.from(message);
	const signatureBytes = Buffer.from(signature, 'base64');
	const secondSignatureBytes = Buffer.from(secondSignature, 'base64');
	const publicKeyBytes = Buffer.from(hexToBuffer(publicKey));
	const secondPublicKeyBytes = Buffer.from(hexToBuffer(secondPublicKey));

	if (signatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error(
			'Invalid first signature length, expected 64-byte signature',
		);
	}

	if (secondSignatureBytes.length !== naclInstance.crypto_sign_BYTES) {
		throw new Error(
			'Invalid second signature length, expected 64-byte signature',
		);
	}

	if (publicKeyBytes.length !== 32) {
		throw new Error('Invalid first publicKey, expected 32-byte publicKey');
	}

	if (secondPublicKeyBytes.length !== 32) {
		throw new Error('Invalid second publicKey, expected 32-byte publicKey');
	}

	const verifyFirstSignature = () =>
		naclInstance.crypto_sign_verify_detached(
			signatureBytes,
			messageBytes,
			publicKeyBytes,
		);
	const verifySecondSignature = () =>
		naclInstance.crypto_sign_verify_detached(
			secondSignatureBytes,
			messageBytes,
			secondPublicKeyBytes,
		);

	return verifyFirstSignature() && verifySecondSignature();
};

/**
 * @method printSignedMessage
 * @param {object}
 * @return {string}
 */

export const printSignedMessage = ({
	message,
	signature,
	publicKey,
	secondSignature,
	secondPublicKey,
}) =>
	[
		signedMessageHeader,
		messageHeader,
		message,
		publicKeyHeader,
		publicKey,
		secondPublicKey ? secondPublicKeyHeader : null,
		secondPublicKey,
		signatureHeader,
		signature,
		secondSignature ? secondSignatureHeader : null,
		secondSignature,
		signatureFooter,
	]
		.filter(Boolean)
		.join('\n');

/**
 * @method signAndPrintMessage
 * @param message
 * @param secret
 * @param secondSecret
 *
 * @return {string}
 */

export const signAndPrintMessage = (message, secret, secondSecret) => {
	const signedMessage = secondSecret
		? signMessageWithTwoSecrets(message, secret, secondSecret)
		: signMessageWithSecret(message, secret);

	return printSignedMessage(signedMessage);
};

/**
 * @method signData
 * @param data Buffer
 * @param secret string
 *
 * @return {string}
 */

export const signData = (data, secret) => {
	const { privateKey } = getPrivateAndPublicKeyBytesFromSecret(secret);
	const signature = naclInstance.crypto_sign_detached(data, privateKey);
	return bufferToHex(signature);
};

/**
 * @method verifyData
 * @param data Buffer
 * @param secondPublicKey
 *
 * @return {boolean}
 */

export const verifyData = (data, signature, publicKey) =>
	naclInstance.crypto_sign_verify_detached(
		hexToBuffer(signature),
		data,
		hexToBuffer(publicKey),
	);
