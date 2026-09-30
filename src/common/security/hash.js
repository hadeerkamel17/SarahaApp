import { compareSync, hashSync } from "bcrypt";

export const hash = async (plainText, SALTS_ROUNDS = 12) => {
  return hashSync(plainText, SALTS_ROUNDS);
};

export const compare = async (plainText, cipherText) => {
  return compareSync(plainText, cipherText);
};
