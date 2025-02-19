import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
const iv = Buffer.from(process.env.INITIALIZATION_VECTOR, "base64");

export function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export const decodeBase64 = (base64) => {
  const decodedString = atob(base64);
  return decodedString;
};

export const generateSurgeShadowSocks2022Password = (timestamp, uuid) => {
  const md5Hash = crypto.createHash("md5").update(timestamp).digest("hex");
  const shortenedHash = md5Hash.substring(0, 32);
  const shortenedUuid = uuid.substring(0, 32);

  const hashBase64 = Buffer.from(shortenedHash).toString("base64");
  const uuidBase64 = Buffer.from(shortenedUuid).toString("base64");
  return `${hashBase64}:${uuidBase64}`;
};
