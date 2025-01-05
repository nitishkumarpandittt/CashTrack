/**
 * Formats a number into a human-readable string with suffixes (e.g., 1K, 1.5M).
 * @param {number} num - The number to format.
 * @returns {string} - The formatted number as a string.
 */

const formatNumber = (num) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0Rs./, "") + "Cr";
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0Rs./, "") + "L";
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0Rs./, "") + "K";
  }
  return num.toString();
};

export default formatNumber;
