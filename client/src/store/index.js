import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import webLocalStorage from 'redux-persist/lib/storage';
import { localStorage as extensionLocalStorage } from 'redux-persist-webextension-storage';
import thunk from 'redux-thunk';
import { isUsingExtension } from '@cd/services/localStorage';
import { DEFAULT_AUTO_LOCK_TIME, NETWORK_NAME } from '@cd/constants/key';
import { getNetworkState } from '@cd/selectors/settings';
import APP_CONFIGS from '../config';
import userReducer from './reducers/userReducer';
import signerReducer from './reducers/signerReducer';
import keysManagerReducer from './reducers/keysManager';
import tokensReducer from './reducers/tokens';
import nftsReducer from './reducers/nfts';
import deployReducer from './reducers/deploys';
import stakeReducer from './reducers/stakes';
import requestReducer from './reducers/request';
import loginModalReducer from './reducers/loginModal';
import settingsReducer from './reducers/settings';
import swapReducer from './reducers/swap';
import liquidityReducer from './reducers/liquidity';
import createWalletReducer, { initialState as createWalletInitialState } from './reducers/createWallet';
import { REQUEST } from './actionTypes';

const isChromeExtension = isUsingExtension();
const persistConfig = {
	key: 'root',
	storage: isChromeExtension ? extensionLocalStorage : webLocalStorage,
	whitelist: ['settings', 'user'],
};

export const initialState = {
	user: {
		publicKey: '',
		accountIndex: 0,
		loginOptions: {},
		balance: null,
	},
	signer: {
		isConnected: false,
		isUnlocked: true,
		error: null,
	},
	keysManager: {},
	tokens: {
		address: [],
	},
	deploys: {
		transfers: [],
	},
	request: {
		isLoading: [],
	},
	settings: {
		theme: '',
		autoLockTime: DEFAULT_AUTO_LOCK_TIME,
		network: NETWORK_NAME,
	},
	nfts: {
		address: [],
	},
	createWallet: {
		...createWalletInitialState,
	},
	swap: {
		swapFrom: {
		},
		swapTo: {
		},
		settings: {},
		isReceiveExact: false,
	},
	liquidity: {
		tokenX: {},
		tokenY: {},
	}
};

const setLoadingStatus = (actionType) => {
	return { type: REQUEST.ADD_REQUEST_LOADING_STATUS, payload: actionType };
};

const removeLoadingStatus = (actionType) => {
	return { type: REQUEST.REMOVE_REQUEST_LOADING_STATUS, payload: actionType };
};

const { requestsReducer, requestsMiddleware } = handleRequests({
	driver: createDriver(axios.create()),
	onRequest: (request, action, store) => {
		store.dispatch(setLoadingStatus(action.type));
		const network = getNetworkState(store.getState);

		const baseURL =
			APP_CONFIGS.APP_ENVIRONMENT === 'local'
				? APP_CONFIGS.API_ROOT
				: network === 'casper-test'
				? 'https://testnet-api.casperdash.io'
				: 'https://api.casperdash.io';

		return { ...request, baseURL: request.baseURL || baseURL };
	},
	onSuccess: (response, action, store) => {
		store.dispatch(removeLoadingStatus(action.type));
		return response;
	},
	onError: (error, action, store) => {
		store.dispatch(removeLoadingStatus(action.type));
		throw error;
	},
	onAbort: (action, store) => {
		store.dispatch(removeLoadingStatus(action.type));
	},
	cache: true,
});

const rootReducers = combineReducers({
	user: userReducer,
	signer: signerReducer,
	keysManager: keysManagerReducer,
	tokens: tokensReducer,
	requests: requestsReducer,
	deploys: deployReducer,
	stakes: stakeReducer,
	request: requestReducer,
	settings: settingsReducer,
	nfts: nftsReducer,
	createWallet: createWalletReducer,
	loginModal: loginModalReducer,
	swap: swapReducer,
	liquidity: liquidityReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const persistedReducer = persistReducer(persistConfig, rootReducers);
const store = createStore(
	persistedReducer,
	initialState,
	composeEnhancers(applyMiddleware(thunk, ...requestsMiddleware)),
);
let persistor = persistStore(store);
export { persistor };
export default store;
