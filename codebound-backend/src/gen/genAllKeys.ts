import crypto from 'crypto';

/**
 * Generate all required API keys and secrets for the application
 * Run with: ts-node src/gen/genAllKeys.ts
 */

console.log('\n=== Generating API Keys and Secrets ===\n');

// Generate ENC_KEY_SECRET and CIPHER_KEY_SECRET (32 bytes each)
const encKey = crypto.randomBytes(32).toString('hex');
const cipherKey = crypto.randomBytes(32).toString('hex');

// Generate API_KEY_SECRET (32 bytes)
const apiKeySecret = crypto.randomBytes(32).toString('hex');

// Generate API_KEY (64 bytes hex - for JWT-like format)
const apiKey = crypto.randomBytes(32).toString('hex');

console.log('Copy these to your .env file:\n');
console.log(`ENC_KEY_SECRET="${encKey}"`);
console.log(`CIPHER_KEY_SECRET="${cipherKey}"`);
console.log(`API_KEY_SECRET="${apiKeySecret}"`);
console.log(`API_KEY="${apiKey}"`);
console.log('\n=== Done ===\n');
