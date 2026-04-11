const imageCache = new Map();

export function cacheImage(coinId, imageUrl) {
  if (!imageCache.has(coinId)) {
    const img = new Image();
    img.src = imageUrl;
    imageCache.set(coinId, imageUrl);
  }
}

export function getImageUrl(coinId, defaultUrl) {
  return imageCache.get(coinId) || defaultUrl;
}

export const XSTOCK_IMAGES = {
  'apple-xstock': '/images/xstocks/apple.png',
  'microsoft-xstock': '/images/xstocks/microsoft.png',
  'alphabet-xstock': '/images/xstocks/alphabet.png',
  'amazon-xstock': '/images/xstocks/amazon.png',
  'meta-xstock': '/images/xstocks/meta.png',
  'nvidia-xstock': '/images/xstocks/nvidia.png',
  'tesla-xstock': '/images/xstocks/tesla.png',
};
