#!/usr/bin/env python3
"""
Script to update the crypto → categories map locally.

The CoinGecko /coins/markets endpoint does not return categories, and calling
/coins/{id} per coin hits the free-tier rate limit hard. Instead, this script
inverts the lookup: it iterates over a curated list of relevant categories and
calls /coins/markets?category=<id> (which is NOT rate-limited) to find every
coin belonging to that category. Each coin is thus tagged with every category
it appears in.

Output: src/core/cryptoCategories.json  →  { coinId: [category names], ... }

Run weekly:
    python3 scripts/refreshCategories.py

Usage:
    python3 scripts/refreshCategories.py [--force]
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime

# Configuration
CATEGORIES_JSON = './src/core/cryptoCategories.json'
LAST_UPDATE_FILE = './src/core/lastCategoriesUpdate.json'
WEEK_IN_SECONDS = 7 * 24 * 60 * 60
PER_CATEGORY = 50

CATEGORIES_URL = 'https://api.coingecko.com/api/v3/coins/categories?order=market_cap_desc'
MARKETS_BY_CATEGORY_URL = (
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category={cat_id}'
    '&order=market_cap_desc&per_page={per_page}&page=1'
)

# Category id keywords considered relevant for tagging coins.
# We keep the top categories by market cap AND any category whose name matches
# these themes (meme, privacy, defi, AI, etc.).
THEME_PATTERN = (
    r'meme|privacy|defi|gaming|artificial intelligence|ai |exchange-based|cex|'
    r'layer-1|metaverse|nft|dex|oracle|depin|rwa|stablecoin|mica|real world assets'
)

HEADERS = '-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
CURL = f'curl -s --max-time 30 {HEADERS}"'


def fetch_json(url):
    """Fetch a URL and parse its JSON response."""
    result = subprocess.run(f'{CURL} "{url}"', shell=True, capture_output=True, text=True)
    try:
        return json.loads(result.stdout or '[]')
    except json.JSONDecodeError:
        return {}


def get_last_update():
    """Get the last update timestamp."""
    if os.path.exists(LAST_UPDATE_FILE):
        with open(LAST_UPDATE_FILE, 'r') as f:
            return json.load(f).get('timestamp', 0)
    return 0


def save_last_update():
    """Save the current timestamp as last update."""
    with open(LAST_UPDATE_FILE, 'w') as f:
        json.dump({'timestamp': int(time.time())}, f)


def should_update():
    """Check if the map should be updated (older than 1 week)."""
    last_update = get_last_update()
    if last_update == 0:
        return True
    return (time.time() - last_update) > WEEK_IN_SECONDS


def main():
    print('=' * 50, flush=True)
    print('CryptoWatch Categories Updater', flush=True)
    print(
        f"Last run: {datetime.fromtimestamp(get_last_update()) if get_last_update() else 'Never'}",
        flush=True,
    )
    print('=' * 50, flush=True)

    if not should_update() and '--force' not in sys.argv:
        print('\nCategories are still fresh (less than 1 week old).', flush=True)
        print('Use --force to update anyway.', flush=True)
        return

    print('\nFetching category list...', flush=True)
    categories = fetch_json(CATEGORIES_URL)
    if not isinstance(categories, list) or not categories:
        print('Failed to fetch the category list.', flush=True)
        sys.exit(1)

    # Sort by market cap desc and keep top N + relevant themed categories.
    def cap(c):
        return c.get('market_cap') or 0

    categories = sorted(categories, key=cap, reverse=True)
    top = [c for c in categories[:15]]
    themed = [c for c in categories[15:] if __import__('re').search(THEME_PATTERN, c['name'])]
    # De-duplicate by id, preserving order.
    seen = set()
    selected = []
    for c in top + themed:
        if c['id'] not in seen and c['id'] != 'stablecoins':
            seen.add(c['id'])
            selected.append(c)
    print(f'  {len(selected)} categories selected for tagging.', flush=True)

    result = {}
    for i, cat in enumerate(selected, 1):
        coins = fetch_json(MARKETS_BY_CATEGORY_URL.format(cat_id=cat['id'], per_page=PER_CATEGORY))
        if not isinstance(coins, list):
            coins = []
        for coin in coins:
            cid = coin.get('id')
            if not cid:
                continue
            names = result.setdefault(cid, [])
            if cat['name'] not in names:
                names.append(cat['name'])
        print(f'  [{i}/{len(selected)}] {cat["name"]}: {len(coins)} coins', flush=True)
        time.sleep(0.3)

    with open(CATEGORIES_JSON, 'w') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f'\nWrote {len(result)} tagged coins to {CATEGORIES_JSON}', flush=True)

    save_last_update()

    print('\n' + '=' * 50, flush=True)
    print('Done! Categories map updated.', flush=True)
    print('=' * 50, flush=True)


if __name__ == '__main__':
    main()
