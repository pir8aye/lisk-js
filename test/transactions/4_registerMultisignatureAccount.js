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
import registerMultisignatureAccount from '../../src/transactions/4_registerMultisignatureAccount';

const time = require('../../src/transactions/utils/time');

describe('#registerMultisignatureAccount transaction', () => {
	const passphrase = 'secret';
	const secondPassphrase = 'second secret';
	const keys = {
		publicKey:
			'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
		privateKey:
			'2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09',
	};
	const timeWithOffset = 38350076;
	const lifetime = 5;
	const minimum = 2;

	let keysgroup;
	let getTimeWithOffsetStub;
	let registerMultisignatureTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox
			.stub(time, 'getTimeWithOffset')
			.returns(timeWithOffset);
		keysgroup = ['+123456789', '-987654321'];
	});

	describe('with first passphrase', () => {
		beforeEach(() => {
			registerMultisignatureTransaction = registerMultisignatureAccount({
				passphrase,
				keysgroup,
				lifetime,
				minimum,
			});
		});

		it('should create a register multisignature transaction', () => {
			registerMultisignatureTransaction.should.be.ok();
		});

		it('should use time.getTimeWithOffset to calculate the timestamp', () => {
			getTimeWithOffsetStub.should.be.calledWithExactly(undefined);
		});

		it('should use time.getTimeWithOffset with an offset of -10 seconds to calculate the timestamp', () => {
			const offset = -10;
			registerMultisignatureAccount({
				passphrase,
				keysgroup,
				lifetime,
				minimum,
				timeOffset: offset,
			});

			getTimeWithOffsetStub.should.be.calledWithExactly(offset);
		});

		describe('returned register multisignature transaction', () => {
			it('should be an object', () => {
				registerMultisignatureTransaction.should.be.type('object');
			});

			it('should have id string', () => {
				registerMultisignatureTransaction.should.have
					.property('id')
					.and.be.type('string');
			});

			it('should have type number equal to 4', () => {
				registerMultisignatureTransaction.should.have
					.property('type')
					.and.be.type('number')
					.and.equal(4);
			});

			it('should have amount string equal to 0', () => {
				registerMultisignatureTransaction.should.have
					.property('amount')
					.and.be.type('string')
					.and.equal('0');
			});

			it('should have fee string equal to 15 LSK', () => {
				registerMultisignatureTransaction.should.have
					.property('fee')
					.and.be.type('string')
					.and.equal('1500000000');
			});

			it('should have recipientId string equal to null', () => {
				registerMultisignatureTransaction.should.have
					.property('recipientId')
					.and.be.null();
			});

			it('should have senderPublicKey hex string equal to sender public key', () => {
				registerMultisignatureTransaction.should.have
					.property('senderPublicKey')
					.and.be.hexString()
					.and.equal(keys.publicKey);
			});

			it('should have timestamp number equal to result of time.getTimeWithOffset', () => {
				registerMultisignatureTransaction.should.have
					.property('timestamp')
					.and.be.type('number')
					.and.equal(timeWithOffset);
			});

			it('should have signature hex string', () => {
				registerMultisignatureTransaction.should.have
					.property('signature')
					.and.be.hexString();
			});

			it('should have asset', () => {
				registerMultisignatureTransaction.should.have
					.property('asset')
					.and.not.be.empty();
			});

			it('should not have a second signature', () => {
				registerMultisignatureTransaction.should.not.have.property(
					'signSignature',
				);
			});

			describe('multisignature asset', () => {
				it('should be object', () => {
					registerMultisignatureTransaction.asset.should.have
						.property('multisignature')
						.and.be.type('object');
				});

				it('should have a min number equal to provided minimum', () => {
					registerMultisignatureTransaction.asset.multisignature.should.have
						.property('min')
						.and.be.type('number')
						.and.be.equal(minimum);
				});

				it('should have a lifetime number equal to provided lifetime', () => {
					registerMultisignatureTransaction.asset.multisignature.should.have
						.property('lifetime')
						.and.be.type('number')
						.and.be.equal(lifetime);
				});

				it('should have a keysgroup array equal to provided keysgroup', () => {
					registerMultisignatureTransaction.asset.multisignature.should.have
						.property('keysgroup')
						.and.be.an.Array()
						.and.be.equal(keysgroup);
				});
			});
		});
	});

	describe('with first and second passphrase', () => {
		beforeEach(() => {
			registerMultisignatureTransaction = registerMultisignatureAccount({
				passphrase,
				secondPassphrase,
				keysgroup,
				lifetime,
				minimum,
			});
		});

		it('should have the second signature property as hex string', () => {
			registerMultisignatureTransaction.should.have
				.property('signSignature')
				.and.be.hexString();
		});
	});
});
