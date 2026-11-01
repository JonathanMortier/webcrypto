import { createProxy } from './_proxy.js';

export default createProxy('https://api.coingecko.com', [
  /^api\/v3\/coins\/(markets|categories)$/,
  /^api\/v3\/coins\/[a-z0-9._-]+(\/market_chart)?$/,
]);
