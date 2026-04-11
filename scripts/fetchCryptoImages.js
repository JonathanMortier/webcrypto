#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false';
const OUTPUT_PATH = './src/core/cryptoImages.json';

function fetchApi(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching crypto data from CoinGecko...');
  
  const cryptos = await fetchApi(API_URL);
  
  const imageUrls = cryptos.map(coin => ({
    id: coin.id,
    symbol: coin.symbol,
    image: coin.image
  }));
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(imageUrls, null, 2));
  console.log(`Saved ${imageUrls.length} image URLs to ${OUTPUT_PATH}`);
}

main().catch(console.error);
