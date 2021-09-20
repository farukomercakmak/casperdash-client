import { CLPublicKey } from 'casper-js-sdk';
import { MIN_TRANSFER } from '../constants/key';

const isValidPublicKey = (publicKey) => {
	try {
		const pbKey = CLPublicKey.fromHex(publicKey);
		return pbKey ? true : false;
	} catch (error) {
		return false;
	}
};

export const validateTransferForm = ({ displayBalance, toAddress, sendAmount }) => {
	let errors = {};
	// to address
	if (!toAddress) {
		errors.toAddress = 'Required.';
	}
	if (!errors.toAddress && !isValidPublicKey(toAddress)) {
		errors.toAddress = 'Invalid address.';
	}
	// send amount

	if (sendAmount < MIN_TRANSFER) {
		errors.sendAmount = 'Amount must be at least 2.5 CSPR.';
	}
	if (!errors.sendAmount && sendAmount > displayBalance) {
		errors.sendAmount = 'Not enough balance.';
	}
	return errors;
};