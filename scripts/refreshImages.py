#!/usr/bin/env python3
"""
Script to update crypto images locally.
Run this script weekly to keep images up to date.

Usage:
    python3 scripts/refreshImages.py
"""

import json
import subprocess
import os
import time
from datetime import datetime, timedelta

# Configuration
API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
CRYPTO_IMAGES_JSON = './src/core/cryptoImages.json'
IMAGES_DIR = './public/images/cryptos'
LAST_UPDATE_FILE = './src/core/lastImageUpdate.json'
WEEK_IN_SECONDS = 7 * 24 * 60 * 60

# Stablecoins exclus de l'affichage → pas besoin de télécharger leurs images
SKIP_SYMBOLS = {
    'usdt', 'usdc', 'dai', 'busd', 'ust', 'tusd', 'usdp', 'usdd',
    'frax', 'lusd', 'usds', 'usde', 'usd1', 'pyusd', 'usdg', 'usdf', 'buidl',
    'figr_heloc', 'usyc', 'usdy',
}

HEADERS = '-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"'


def fetch_api():
    """Fetch crypto data from CoinGecko API."""
    print("Fetching crypto data from CoinGecko...")
    result = subprocess.run(
        f'curl -s "{API_URL}"',
        shell=True,
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)


def get_last_update():
    """Get the last update timestamp."""
    if os.path.exists(LAST_UPDATE_FILE):
        with open(LAST_UPDATE_FILE, 'r') as f:
            data = json.load(f)
            return data.get('timestamp', 0)
    return 0


def save_last_update():
    """Save the current timestamp as last update."""
    with open(LAST_UPDATE_FILE, 'w') as f:
        json.dump({'timestamp': int(time.time())}, f)


def should_update():
    """Check if images should be updated (older than 1 week)."""
    last_update = get_last_update()
    if last_update == 0:
        return True
    return (time.time() - last_update) > WEEK_IN_SECONDS


def download_image(url, filepath):
    """Download a single image."""
    result = subprocess.run(
        f'curl -s -L {HEADERS} -o {filepath} "{url}"',
        shell=True
    )
    return os.path.exists(filepath) and os.path.getsize(filepath) > 100


def main():
    print("=" * 50)
    print("CryptoWatch Image Updater")
    print(f"Last run: {datetime.fromtimestamp(get_last_update()) if get_last_update() else 'Never'}")
    print("=" * 50)
    
    # Check if update is needed
    if not should_update():
        print("\nImages are still fresh (less than 1 week old).")
        print("Use --force to update anyway.")
        return
    
    # Fetch new data
    cryptos = fetch_api()
    all_urls = [{'id': coin['id'], 'symbol': coin['symbol'], 'image': coin['image']} for coin in cryptos]
    
    # Filtrer les stablecoins exclus de l'affichage
    image_urls = [c for c in all_urls if c['symbol'] not in SKIP_SYMBOLS]
    skipped = len(all_urls) - len(image_urls)
    
    # Save filtered URLs
    with open(CRYPTO_IMAGES_JSON, 'w') as f:
        json.dump(image_urls, f, indent=2)
    print(f"\nUpdated {len(image_urls)} image URLs ({skipped} stablecoins filtrés) dans {CRYPTO_IMAGES_JSON}")
    
    # Ensure directory exists
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    # Download images
    print(f"\nDownloading images to {IMAGES_DIR}...")
    success = 0
    failed = 0
    total = len(image_urls)

    for i, item in enumerate(image_urls):
        filepath = f'{IMAGES_DIR}/{item["id"]}.png'
        if download_image(item['image'], filepath):
            success += 1
            print(f'  [{i+1}/{total}] {item["id"]}')
        else:
            failed += 1
            print(f'  [{i+1}/{total}] FAILED: {item["id"]}')
        time.sleep(0.2)
    
    # Save last update timestamp
    save_last_update()
    
    print("\n" + "=" * 50)
    print(f"Done! {success} images updated, {failed} failed.")
    print(f"Next update needed in: 7 days")
    print("=" * 50)


if __name__ == '__main__':
    import sys
    if '--force' in sys.argv:
        # Force update by resetting timestamp
        os.remove(LAST_UPDATE_FILE) if os.path.exists(LAST_UPDATE_FILE) else None
    
    main()
