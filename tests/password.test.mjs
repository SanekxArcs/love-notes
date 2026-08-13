import assert from "node:assert/strict";
import test from "node:test";
import {
  hashPassword,
  isPasswordHash,
  validateNewPassword,
  verifyPassword,
} from "../src/lib/password.ts";

test("hashes and verifies a password without retaining plaintext", async () => {
  const password = "correct horse battery staple";
  const hash = await hashPassword(password);

  assert.equal(isPasswordHash(hash), true);
  assert.equal(hash.includes(password), false);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("supports legacy plaintext only for login migration", async () => {
  assert.equal(await verifyPassword("legacy-password", "legacy-password"), true);
  assert.equal(await verifyPassword("wrong", "legacy-password"), false);
});

test("rejects malformed hashes and unsafe new-password lengths", async () => {
  assert.equal(await verifyPassword("password", "scrypt$bad$value"), false);
  assert.equal(validateNewPassword("short"), false);
  assert.equal(validateNewPassword("a".repeat(8)), true);
  assert.equal(validateNewPassword("a".repeat(129)), false);
});
