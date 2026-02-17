// ============================================================
// YYC3 Hacker Chatbot — Web Crypto API Key Encryption
// Phase 14: Security Dimension (D5)
//
// 使用 Web Crypto API (AES-GCM 256-bit) 加密/解密敏感数据
// 密钥从 passphrase 派生 (PBKDF2), 盐值固定于设备指纹
// 纯前端实现, 无后端依赖
// ============================================================

const SALT_KEY = 'yyc3-crypto-salt';
const ITERATIONS = 100000;
const KEY_LENGTH = 256;

/**
 * 获取或生成设备固定盐值
 */
function getDeviceSalt(): Uint8Array {
  let saltHex = localStorage.getItem(SALT_KEY);
  if (!saltHex) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(SALT_KEY, saltHex);
  }
  const bytes = new Uint8Array(saltHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(saltHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * 从 passphrase 派生 AES-GCM 密钥
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: getDeviceSalt(),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// 使用设备指纹作为默认 passphrase (纯自用场景)
const DEVICE_PASSPHRASE = `YYC3-${navigator.userAgent.slice(0, 32)}-LOCAL`;

/**
 * 加密字符串 → Base64 编码密文
 */
export async function encryptValue(plaintext: string): Promise<string> {
  try {
    const key = await deriveKey(DEVICE_PASSPHRASE);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );

    // Pack: IV (12 bytes) + ciphertext
    const packed = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    packed.set(iv);
    packed.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...packed));
  } catch {
    // Fallback: return raw (e.g., in test environments without Web Crypto)
    return plaintext;
  }
}

/**
 * 解密 Base64 编码密文 → 明文
 */
export async function decryptValue(encrypted: string): Promise<string> {
  try {
    const key = await deriveKey(DEVICE_PASSPHRASE);
    const packed = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

    const iv = packed.slice(0, 12);
    const ciphertext = packed.slice(12);

    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plainBuffer);
  } catch {
    // Fallback: treat as plaintext (migration from unencrypted storage)
    return encrypted;
  }
}

/**
 * 掩码显示 API Key (e.g., "sk-xxxx...xxxx")
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) return key ? '••••••••' : '';
  return `${key.slice(0, 6)}${'•'.repeat(8)}${key.slice(-4)}`;
}

/**
 * 检查 Web Crypto API 是否可用
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
