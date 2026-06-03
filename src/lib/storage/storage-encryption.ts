// ============================================================
// YYC3 AI Family — Storage Encryption Service
// Phase: 前端一体化存�?架构
//
// 基于 Web Crypto API 的客户端加密方案：
//   - AES-GCM 256-bit 数据加�?
//   - PBKDF2 密钥派�?
//   - 自动检测环境支持
//   - 零上传：密钥永不离开本地
// ============================================================

const ALGORITHM = 'AES-GCM' as const;
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100_000;

function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * 从密码派生 AES 密钥
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password).buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * 加密字符串数据
 */
export async function encryptData(
  plaintext: string,
  password: string,
): Promise<{ ciphertext: string; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
  };
}

/**
 * 解密字符串数据
 */
export async function decryptData(
  ciphertext: string,
  password: string,
  salt: string,
  iv: string,
): Promise<string> {
  const key = await deriveKey(password, base64ToBytes(salt));
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: base64ToBytes(iv) as BufferSource },
    key,
    base64ToBytes(ciphertext) as BufferSource,
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * 检查浏览器是否支持加密
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues !== 'undefined';
}
