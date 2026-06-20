export const getActivePromoForProduct = (productId, promotionsList) => {
  if (!promotionsList || promotionsList.length === 0 || !productId) return null;
  
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const current = `${hours}:${minutes}:${seconds}`;
  
  // Filter promotions that apply to this product
  const productPromos = promotionsList.filter(p => p.product_ids && p.product_ids.includes(productId));
  
  let bestPromo = null;
  
  for (const promo of productPromos) {
    let isActive = false;
    const start = promo.start_time;
    const end = promo.end_time;
    
    if (!start || !end) {
      isActive = true;
    } else {
      if (start <= end) {
        isActive = current >= start && current <= end;
      } else {
        isActive = current >= start || current <= end;
      }
    }
    
    if (isActive) {
      if (!bestPromo || Number(promo.discount) > Number(bestPromo.discount)) {
        bestPromo = promo;
      }
    }
  }
  
  return bestPromo;
};

export const getScheduledPromoForProduct = (productId, promotionsList) => {
  if (!promotionsList || promotionsList.length === 0 || !productId) return null;
  
  const active = getActivePromoForProduct(productId, promotionsList);
  if (active) return null; // If active, don't show scheduled
  
  const productPromos = promotionsList.filter(p => p.product_ids && p.product_ids.includes(productId));
  if (productPromos.length === 0) return null;
  
  return productPromos.reduce((best, current) => {
    if (!best || Number(current.discount) > Number(best.discount)) return current;
    return best;
  }, null);
};

export const getEffectivePrice = (product, promotionsList) => {
  const price = Number(product.price || 0);
  const activePromo = getActivePromoForProduct(product.product_id, promotionsList);
  if (activePromo) {
    return price * (1 - Number(activePromo.discount) / 100);
  }
  return price;
};
