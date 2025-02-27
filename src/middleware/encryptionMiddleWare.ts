// import env from "@/libs/env";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

// const ALGORITHM = env.ALGORITHM;
// const KEY = Buffer.from(env.KEY, "base64");

// export const encryptData = (data: object) => {
//   const jsonData = JSON.stringify(data);
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
//   let encrypted = cipher.update(jsonData, "utf8", "base64");
//   encrypted += cipher.final("base64");
//   return {
//     iv: iv.toString("base64"),
//     encryptedData: encrypted,
//   };
//   //   return {};
// };

// export function decryptData(ivCiphertextB64: string) {
//   const ivCiphertext = Buffer.from(ivCiphertextB64, "base64url");
//   const iv = ivCiphertext.subarray(0, 16);
//   const ciphertext = ivCiphertext.subarray(16);
//   const cipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
//   let decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
//   return decrypted.toString("utf-8");
// }

// Middleware
// export const encryptionMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   console.log("here");
//   const originalJson = res.json;
//   res.json = function (data: any) {
//     try {
//       const encrypted = encryptData(data);
//       return originalJson.call(this, encrypted);
//     } catch (error) {
//       console.error("Encryption error:", error);
//       return res.status(500).json({ error: "Encryption failed" });
//     }
//   };
//   next();
// };
