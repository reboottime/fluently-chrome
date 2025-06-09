/**
* Generates a cryptographic hash of a string using the Web Crypto API
* @param {string} input - The string to hash
* @param {string} algorithm - The hashing algorithm to use (default: 'SHA-256')
* @returns {Promise<string>} A promise that resolves to the hex-encoded hash string
*/
export const getStringHash = async (input: string, algorithm = 'SHA-256') => {
    /**
     * Available algorithms in Chrome:
        'SHA-1' (not recommended for security-critical applications)
        'SHA-256' (recommended default)
        'SHA-384'
        'SHA-512'
    */

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}