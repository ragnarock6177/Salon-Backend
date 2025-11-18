import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = process.env.CRYPTO_KEY || 'f93e8f7b3d0c4e55b2a1d89c77f04b1eaf93c942cd0b8ef2c4b11e7d53f8ae91';
const IV_LENGTH = process.env.IV_LENGTH;

function encrypt(text) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');

  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export default { encrypt, decrypt };
