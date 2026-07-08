/**
 * Format numbers with Indian numbering system symbols
 * @param {number} num - The number to format
 * @returns {string} - Formatted number with K (thousands) or L (lakhs) suffix
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const number = Number(num);

  // Less than 1000 - show as is
  if (number < 1000) {
    return number.toString();
  }

  // 1000 to 99,999 - show with K (thousands)
  if (number < 100000) {
    const thousands = number / 1000;
    // If it's a whole number, don't show decimal
    if (thousands % 1 === 0) {
      return `${thousands}K`;
    }
    // Show one decimal place for precision
    return `${thousands.toFixed(1)}K`;
  }

  // 100,000 and above - show with L (lakhs)
  const lakhs = number / 100000;
  // If it's a whole number, don't show decimal
  if (lakhs % 1 === 0) {
    return `${lakhs}L`;
  }
  // Show one decimal place for precision
  return `${lakhs.toFixed(1)}L`;
};

/**
 * Format number with commas for better readability (fallback option)
 * @param {number} num - The number to format
 * @returns {string} - Formatted number with commas
 */
export const formatNumberWithCommas = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  
  return Number(num).toLocaleString('en-IN');
};