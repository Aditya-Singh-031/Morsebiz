import config from '@/config/config';

/**
 * Get product image URL for display
 * @param {string} imageName - Image name/URL from database
 * @returns {string} - Cleaned image URL or fallback
 */
export function getProductImageUrl(imageName) {
  // If no imageName provided, return fallback
  if (!imageName || typeof imageName !== 'string') {
    return '/images/no-image.png';
  }

  // Clean the URL - remove extra spaces, backticks, and quotes
  const cleanUrl = imageName.trim().replace(/[`"']/g, '').trim();
  
  // Validate URL before returning
  try {
    new URL(cleanUrl);
    return cleanUrl;
  } catch {
    // If invalid URL, return fallback
    return '/images/no-image.png';
  }
}

/**
 * Generate image URL for product (used in ProductsTable)
 * @param {Object} product - Product object
 * @returns {string|null} - Generated image URL or null if no valid image found
 */
export const getProductTableImageUrl = (product) => {
  // Priority 1: Check partsimages array (should contain full URLs)
  if (Array.isArray(product.partsimages) && product.partsimages.length > 0) {
    const firstImage = product.partsimages[0];
    if (typeof firstImage === 'string' && firstImage.trim() !== '' && firstImage.toLowerCase() !== 'null') {
      // Clean the URL - remove extra spaces, backticks, and quotes
      const cleanUrl = firstImage.trim().replace(/[`"']/g, '').trim();
      return cleanUrl;
    }
  }

  // Priority 2: Check legacy imageUrl field
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '' && product.imageUrl.toLowerCase() !== 'null') {
    const cleanUrl = product.imageUrl.trim().replace(/[`"']/g, '').trim();
    return cleanUrl;
  }

  // Priority 3: Check image field
  if (product.image && typeof product.image === 'string' && product.image.trim() !== '' && product.image.toLowerCase() !== 'null') {
    const cleanUrl = product.image.trim().replace(/[`"']/g, '').trim();
    return cleanUrl;
  }

  // Return null if no valid image found - let component handle fallback
  return null;
};