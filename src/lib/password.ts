import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";

const PASSWORD_PREFIX = "scrypt";
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
  N: 2 ** 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
} as const;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

function scrypt(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export function isPasswordHash(value: string) {
  return value.startsWith(`${PASSWORD_PREFIX}$`);
}

export function validateNewPassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt);
  return [
    PASSWORD_PREFIX,
    SCRYPT_OPTIONS.N,
    SCRYPT_OPTIONS.r,
    SCRYPT_OPTIONS.p,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

function safeLegacyCompare(password: string, storedPassword: string) {
  const supplied = Buffer.from(password);
  const stored = Buffer.from(storedPassword);
  return supplied.length === stored.length && timingSafeEqual(supplied, stored);
}

export async function verifyPassword(password: string, storedPassword: string) {
  if (!isPasswordHash(storedPassword)) {
    return safeLegacyCompare(password, storedPassword);
  }

  const [prefix, nValue, rValue, pValue, saltValue, hashValue, extra] =
    storedPassword.split("$");
  if (
    prefix !== PASSWORD_PREFIX ||
    extra !== undefined ||
    !saltValue ||
    !hashValue
  ) {
    return false;
  }

  const N = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);
  if (
    N !== SCRYPT_OPTIONS.N ||
    r !== SCRYPT_OPTIONS.r ||
    p !== SCRYPT_OPTIONS.p
  ) {
    return false;
  }

  try {
    const expected = Buffer.from(hashValue, "base64url");
    const actual = await scrypt(password, Buffer.from(saltValue, "base64url"));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
