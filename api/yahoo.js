import { createProxy } from './_proxy.js';

export default createProxy('https://query1.finance.yahoo.com', [
  /^v8\/finance\/spark$/,
  /^v8\/finance\/chart\/[A-Za-z0-9^=.%-]+$/,
]);
