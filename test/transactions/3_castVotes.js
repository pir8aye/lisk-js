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
import castVotes from '../../src/transactions/3_castVotes';

const time = require('../../src/transactions/utils/time');

describe('#castVotes transaction', () => {
	const passphrase = 'secret';
	const secondPassphrase = 'second secret';
	const publicKey =
		'5d036a858ce89f844491762eb89e2bfbd50a4a0a0da658e4b2628b25b117ae09';
	const publicKeys = [`+${publicKey}`];
	const address = '18160565574430594874L';
	const timeWithOffset = 38350076;

	let getTimeWithOffsetStub;
	let castVotesTransaction;

	beforeEach(() => {
		getTimeWithOffsetStub = sandbox
			.stub(time, 'getTimeWithOffset')
			.returns(timeWithOffset);
	});

	describe('with first passphrase', () => {
		beforeEach(() => {
			castVotesTransaction = castVotes({ passphrase, delegates: publicKeys });
		});

		it('should create a cast votes transaction', () => {
			castVotesTransaction.should.be.ok();
		});

		it('should use time.getTimeWithOffset to calculate the timestamp', () => {
			getTimeWithOffsetStub.should.be.calledWithExactly(undefined);
		});

		it('should use time.getTimeWithOffset with an offset of -10 seconds to calculate the timestamp', () => {
			const offset = -10;
			castVotes({ passphrase, delegates: publicKeys, timeOffset: offset });

			getTimeWithOffsetStub.should.be.calledWithExactly(offset);
		});

		describe('returned cast votes transaction', () => {
			it('should be an object', () => {
				castVotesTransaction.should.be.type('object');
			});

			it('should have id string', () => {
				castVotesTransaction.should.have.property('id').and.be.type('string');
			});

			it('should have type number equal to 3', () => {
				castVotesTransaction.should.have
					.property('type')
					.and.be.type('number')
					.and.equal(3);
			});

			it('should have amount string equal to 0', () => {
				castVotesTransaction.should.have
					.property('amount')
					.and.be.type('string')
					.and.equal('0');
			});

			it('should have fee string equal to 100000000', () => {
				castVotesTransaction.should.have
					.property('fee')
					.and.be.type('string')
					.and.equal('100000000');
			});

			it('should have recipientId string equal to address', () => {
				castVotesTransaction.should.have
					.property('recipientId')
					.and.be.type('string')
					.and.equal(address);
			});

			it('should have senderPublicKey hex string equal to sender public key', () => {
				castVotesTransaction.should.have
					.property('senderPublicKey')
					.and.be.hexString()
					.and.equal(publicKey);
			});

			it('should have timestamp number equal to result of time.getTimeWithOffset', () => {
				castVotesTransaction.should.have
					.property('timestamp')
					.and.be.type('number')
					.and.equal(timeWithOffset);
			});

			it('should have signature hex string', () => {
				castVotesTransaction.should.have
					.property('signature')
					.and.be.hexString();
			});

			it('should not have the second signature property', () => {
				castVotesTransaction.should.not.have.property('signSignature');
			});

			it('should have asset', () => {
				castVotesTransaction.should.have.property('asset').and.not.be.empty();
			});

			describe('votes asset', () => {
				it('should be object', () => {
					castVotesTransaction.asset.should.have
						.property('votes')
						.and.be.type('object');
				});

				it('should not be empty', () => {
					castVotesTransaction.asset.votes.should.not.be.empty();
				});

				it('should contain one element', () => {
					castVotesTransaction.asset.votes.should.have.length(1);
				});

				it('should have public keys in hex', () => {
					castVotesTransaction.asset.votes.forEach(v => {
						v.should.be.type('string').and.startWith('+');
						v.slice(1).should.be.hexString();
					});
				});

				it('should have a vote for the delegate public key', () => {
					const v = castVotesTransaction.asset.votes[0];
					v.substring(1, v.length).should.be.equal(publicKey);
				});
			});
		});
	});

	describe('with first and second passphrase', () => {
		beforeEach(() => {
			castVotesTransaction = castVotes({
				passphrase,
				delegates: publicKeys,
				secondPassphrase,
			});
		});

		it('should have the second signature property as hex string', () => {
			castVotesTransaction.should.have
				.property('signSignature')
				.and.be.hexString();
		});
	});
});
