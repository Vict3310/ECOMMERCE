/** URL segment for a product (name-based slug, matches existing deep links). */
export function getProductSlug(product) {
  if (!product?.name) return '';
  return product.name.toLowerCase().replace(/\s+/g, '-');
}

export function getProductPath(product) {
  const slug = getProductSlug(product);
  if (!slug) return '/shop';
  return `/product/${encodeURIComponent(slug)}`;
}

/**
 * Resolve a product from `/product/:slug` where slug is id or name slug.
 */
/** Maps URL path to legacy `view` string used by Navbar highlighting. */
export function getViewFromPathname(pathname) {
  if (!pathname || pathname === '/') return 'home';
  const parts = pathname.split('/').filter(Boolean);
  if (!parts.length) return 'home';
  if (parts[0] === 'product') return 'detail';
  if (parts[0] === 'order-confirmation') return 'confirmation';
  return parts[0];
}

export function findProductFromPathParam(products, param) {
  if (!param || !products?.length) return null;
  const decoded = decodeURIComponent(param);
  return (
    products.find((p) => p.id === decoded) ||
    products.find((p) => getProductSlug(p) === decoded) ||
    null
  );
}
