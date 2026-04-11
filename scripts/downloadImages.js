#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const CRYPTOS_JSON_PATH = './src/core/cryptoImages.json';
const IMAGES_DIR = './public/images/cryptos';
const IMAGE_URLS = JSON.parse(fs.readFileSync(CRYPTOS_JSON_PATH, 'utf8'));

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Downloading ${IMAGE_URLS.length} crypto images...`);
  
  let success = 0;
  let failed = 0;
  
  for (const { id, image } of IMAGE_URLS) {
    const filename = `${id}.png`;
    const filepath = path.join(IMAGES_DIR, filename);
    
    try {
      await downloadImage(image, filepath);
      success++;
      if (success % 10 === 0) {
        console.log(`Progress: ${success}/${IMAGE_URLS.length}`);
      }
    } catch (err) {
      failed++;
      console.error(`Failed to download ${id}: ${err.message}`);
    }
  }
  
  console.log(`\nDone! ${success} images downloaded, ${failed} failed.`);
}

main().catch(console.error);
