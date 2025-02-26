import { SETTINGS } from '../store/actionTypes';

export const updateAutoLockTime = (autoLockTime) => {
	return { type: SETTINGS.SET_AUTO_LOCK_TIME, payload: { autoLockTime } };
};

export const updateNetwork = (network) => {
	return { type: SETTINGS.SET_NETWORK, payload: { network } };
};
