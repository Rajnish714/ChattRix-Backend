import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function createHash(value) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export async function compareHash(plainValue, hashedValue) {
  return bcrypt.compare(plainValue, hashedValue);
}