import { format } from 'date-fns'; // Using date-fns, install if needed: npm install date-fns

export const formatTimestamp = (timestamp, fmt = 'yyyy-MM-dd HH:mm:ss') => {
  if (!timestamp) return 'N/A';
  try {
    // Assuming timestamp is in a format Date can parse (like ISO 8601)
    const date = new Date(timestamp);
    return format(date, fmt);
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return timestamp; // Return original if formatting fails
  }
};