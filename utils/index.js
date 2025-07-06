/**
 * Formats a number into a human-readable string with suffixes (e.g., 1K, 1.5M).
 * @param {number} num - The number to format.
 * @returns {string} - The formatted number as a string.
 */

const formatNumber = (num) => {
  // Handle invalid numbers
  if (isNaN(num) || num === null || num === undefined) {
    return "0";
  }

  // Convert to number if it's a string
  const number = Number(num);

  if (number >= 1e9) {
    return (number / 1e9).toFixed(1).replace(/\.0$/, "") + "Cr";
  }
  if (number >= 1e6) {
    return (number / 1e6).toFixed(1).replace(/\.0$/, "") + "L";
  }
  if (number >= 1e3) {
    return (number / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return number.toString();
};

export default formatNumber;
