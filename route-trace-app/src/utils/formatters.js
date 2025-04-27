// ----- File: src\utils\formatters.js -----
import { format, formatDistanceToNow, isValid } from 'date-fns'; // Using date-fns

/**
 * Formats a timestamp into a human-readable string.
 * @param {string | number | Date} timestamp - The timestamp to format (ISO string, epoch ms, or Date object).
 * @param {string} fmt - The date-fns format string (e.g., 'yyyy-MM-dd HH:mm:ss', 'PPp', 'short').
 *                       See: https://date-fns.org/v2.28.0/docs/format
 * @returns {string} The formatted date string or 'N/A' if invalid.
 */
export const formatTimestamp = (timestamp, fmt = 'yyyy-MM-dd HH:mm:ss') => {
  if (!timestamp) return 'N/A';

  try {
    const date = new Date(timestamp);

    // Check if the created date object is valid
    if (!isValid(date)) {
        console.warn(`Invalid timestamp provided for formatting: ${timestamp}`);
        // Attempt to return original if it looks somewhat readable, else 'Invalid Date'
        return typeof timestamp === 'string' ? timestamp : 'Invalid Date';
    }

    // Handle special format keywords
    if (fmt === 'relative') {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    if (fmt === 'short') {
        fmt = 'MMM d, HH:mm'; // Example short format
    }

    return format(date, fmt);
  } catch (error) {
    console.error("Error formatting timestamp:", error, "Input:", timestamp);
    // Attempt to return original if it looks somewhat readable, else 'Formatting Error'
    return typeof timestamp === 'string' ? timestamp : 'Formatting Error';
  }
};

// Example usage:
// formatTimestamp('2023-10-27T10:30:00Z') -> "2023-10-27 10:30:00" (depends on local timezone)
// formatTimestamp('2023-10-27T10:30:00Z', 'PPp') -> "Oct 27, 2023, 10:30:00 AM"
// formatTimestamp(Date.now() - 60000, 'relative') -> "about 1 minute ago"
// formatTimestamp('invalid-date-string') -> "invalid-date-string" (or "Invalid Date")