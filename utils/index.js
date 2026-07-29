/**
 * Formats a number into a human-readable string using the Indian numbering
 * system (K = thousand, L = lakh = 1e5, Cr = crore = 1e7).
 * @param {number|string} num - The number to format.
 * @returns {string} - The formatted number as a string.
 */

const formatNumber = (num) => {
  // Handle invalid numbers
  const number = Number(num);
  if (num === null || num === undefined || num === "" || Number.isNaN(number)) {
    return "0";
  }

  // Abbreviate magnitude, then re-apply the sign so negatives (e.g. a deficit)
  // format the same way positives do.
  const sign = number < 0 ? "-" : "";
  const abs = Math.abs(number);
  const format = (value, suffix) =>
    sign + value.toFixed(1).replace(/\.0$/, "") + suffix;

  if (abs >= 1e7) return format(abs / 1e7, "Cr");
  if (abs >= 1e5) return format(abs / 1e5, "L");
  if (abs >= 1e3) return format(abs / 1e3, "K");

  return sign + abs.toString();
};

export default formatNumber;
