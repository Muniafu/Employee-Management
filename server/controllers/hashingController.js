require('dotenv').config();
const crypto = require('crypto');
const { promisify } = require('util');

// Use Node's built-in crypto module instead of CryptoJS
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // For AES, this is always 16

// Promisify the randomBytes function
const randomBytesAsync = promisify(crypto.randomBytes);

const encrypt = async (text) => {
  try {
    const iv = await randomBytesAsync(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    throw new Error('Encryption failed');
  }
};

const decrypt = async (text) => {
  try {
    const [ivPart, encryptedPart] = text.split(':');
    if (!ivPart || !encryptedPart) throw new Error('Invalid encrypted text');
    
    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(encryptedPart, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

module.exports = {
  encryptData: async (data) => {
    try {
      const encrypted = await encrypt(JSON.stringify(data));
      return { encryptedData: encrypted };
    } catch (error) {
      throw error;
    }
  },

  decryptData: async (encryptedData) => {
    try {
      const decrypted = await decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      throw error;
    }
  },

  // Alias for decryptData for backward compatibility
  decryptePass: async (encryptedData) => {
    return module.exports.decryptData(encryptedData);
  }
};