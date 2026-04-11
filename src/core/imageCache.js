import cryptoImages from './cryptoImages.json';

const imageCache = new Map();

export const XSTOCK_IMAGES = {
  'apple-xstock': '/images/xstocks/apple.png',
  'microsoft-xstock': '/images/xstocks/microsoft.png',
  'alphabet-xstock': '/images/xstocks/alphabet.png',
  'amazon-xstock': '/images/xstocks/amazon.png',
  'meta-xstock': '/images/xstocks/meta.png',
  'nvidia-xstock': '/images/xstocks/nvidia.png',
  'tesla-xstock': '/images/xstocks/tesla.png',
};

export const CRYPTO_IMAGES = {};
cryptoImages.forEach(({ id, image }) => {
  CRYPTO_IMAGES[id] = `/images/cryptos/${id}.png`;
});

export function getImageUrl(coinId, defaultUrl) {
  return CRYPTO_IMAGES[coinId] || XSTOCK_IMAGES[coinId] || defaultUrl;
}

export function cacheImage(coinId, imageUrl) {
  if (!imageCache.has(coinId)) {
    const img = new Image();
    img.src = imageUrl;
    imageCache.set(coinId, imageUrl);
  }
}
