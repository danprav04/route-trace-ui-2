// ----- File: src\utils\validators.js -----

/**
 * Validates if a string is a valid IPv4 address.
 * @param {string} ip - The string to validate.
 * @returns {boolean} True if valid IPv4, false otherwise.
 */
export const isValidIPv4 = (ip) => {
    if (typeof ip !== 'string') {
        return false;
    }
    // Basic IPv4 regex: checks for 4 blocks of 0-255 separated by dots.
    // Allows leading zeros (e.g., 192.168.010.001), adjust if strict format needed.
    const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
    return ipv4Regex.test(ip.trim());
};

// Add other common validators here if needed, e.g.,
// export const isValidMacAddress = (mac) => { ... };
// export const isNotEmpty = (value) => value && value.trim().length > 0;