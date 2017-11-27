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
import transferOutOfDapp from '../../src/transactions/7_transferOutOfDapp';

const time = require('../../src/transactions/utils/time');

describe('#transferOutOfDapp', () => {
	const fixedPoint = 10 ** 8;
	const transactionId = '9876567';
	const recipientId = '989234L';
	const dappId = '1234213';
	const passphrase = 'secret';
	const secondPassphrase = 'secondSecret';
	const publicKey =
		'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const amount = (10 * fixedPoint).toString();
	const transferFee = (0.1 * fixedPoint).toString();
	const timeWithOffset = 38350076;
	const offset = -10;

	let getTimeWithOffsetStub;
	let transferOutOfDappTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox
			.stub(time, 'getTimeWithOffset')
			.returns(timeWithOffset);
	});

	describe('with first passphrase', () => {
		beforeEach(() => {
			transferOutOfDappTransaction = transferOutOfDapp({
				dappId,
				transactionId,
				recipientId,
				amount,
				passphrase,
			});
		});

		it('should create an out transfer dapp transaction', () => {
			transferOutOfDappTransaction.should.be.ok();
		});

		it('should use time.getTimeWithOffset to get the time for the timestamp', () => {
			getTimeWithOffsetStub.should.be.calledWithExactly(undefined);
		});

		it('should use time.getTimeWithOffset with an offset of -10 seconds to get the time for the timestamp', () => {
			transferOutOfDapp({
				dappId,
				transactionId,
				recipientId,
				amount,
				passphrase,
				timeOffset: offset,
			});

			getTimeWithOffsetStub.should.be.calledWithExactly(offset);
		});

		describe('returned out of dapp transfer transaction object', () => {
			it('should be an object', () => {
				transferOutOfDappTransaction.should.be.type('object');
			});

			it('should have id string', () => {
				transferOutOfDappTransaction.should.have
					.property('id')
					.and.be.type('string');
			});

			it('should have type number equal to 7', () => {
				transferOutOfDappTransaction.should.have
					.property('type')
					.and.be.type('number')
					.and.equal(7);
			});

			it('should have amount string equal to 10 LSK', () => {
				transferOutOfDappTransaction.should.have
					.property('amount')
					.and.be.type('string')
					.and.equal(amount);
			});

			it('should have fee string equal to 0.1 LSK', () => {
				transferOutOfDappTransaction.should.have
					.property('fee')
					.and.be.type('string')
					.and.equal(transferFee);
			});

			it('should have recipientId equal to provided recipientId', () => {
				transferOutOfDappTransaction.should.have
					.property('recipientId')
					.and.be.equal(recipientId);
			});

			it('should have senderPublicKey hex string equal to sender public key', () => {
				transferOutOfDappTransaction.should.have
					.property('senderPublicKey')
					.and.be.hexString()
					.and.equal(publicKey);
			});

			it('should have timestamp number equal to result of time.getTimeWithOffset', () => {
				transferOutOfDappTransaction.should.have
					.property('timestamp')
					.and.be.type('number')
					.and.equal(timeWithOffset);
			});

			it('should have signature hex string', () => {
				transferOutOfDappTransaction.should.have
					.property('signature')
					.and.be.hexString();
			});

			it('should not have the second signature property', () => {
				transferOutOfDappTransaction.should.not.have.property('signSignature');
			});

			it('should have an asset object', () => {
				transferOutOfDappTransaction.should.have
					.property('asset')
					.and.be.type('object');
			});

			describe('asset', () => {
				it('should have the out transfer dapp id', () => {
					transferOutOfDappTransaction.asset.should.have
						.property('outTransfer')
						.with.property('dappId')
						.and.be.equal(dappId);
				});

				it('should have the out transfer transaction id', () => {
					transferOutOfDappTransaction.asset.should.have
						.property('outTransfer')
						.with.property('transactionId')
						.and.be.equal(transactionId);
				});
			});
		});

		describe('with first and second passphrase', () => {
			beforeEach(() => {
				transferOutOfDappTransaction = transferOutOfDapp({
					dappId,
					transactionId,
					recipientId,
					amount,
					passphrase,
					secondPassphrase,
				});
			});

			it('should have the second signature property as hex string', () => {
				transferOutOfDappTransaction.should.have
					.property('signSignature')
					.and.be.hexString();
			});
		});
	});
});
