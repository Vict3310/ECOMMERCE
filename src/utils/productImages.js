/**
 * Ordered gallery URLs for a product. Uses `images` when present, otherwise `[image]`.
 * Dedupes while preserving order.
 */
export function getProductGalleryImages(product) {
  if (!product) return [];
  const raw = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach((u) => {
      if (u && String(u).trim()) raw.push(String(u).trim());
    });
  } else if (product.image && String(product.image).trim()) {
    raw.push(String(product.image).trim());
  }
  const seen = new Set();
  return raw.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

export function getProductPrimaryImage(product) {
  const g = getProductGalleryImages(product);
  return g[0] || '';
}
