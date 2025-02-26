import { PRICE } from '../store/actionTypes';

/**
 * @returns {object}
 */
export const fetchPriceHistory = () => ({
	type: PRICE.FETCH_PRICE_HISTORY,
	request: {
		baseURL: 'https://api.coingecko.com/',
		url: 'api/v3/coins/casper-network/market_chart?vs_currency=usd&days=30&interval=hourly',
	},
});

export const fetchCSPRMarketInfo = () => ({
	type: PRICE.FETCH_CSPR_MARKET_INFO,
	request: {
		url: 'price/latest',
	},
});
