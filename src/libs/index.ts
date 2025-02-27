import { NextFunction } from "express";
import Joi from "joi";
import ErrorHandlers from "./errorHandler";
import bcrypt from "bcrypt";

/**
 * Validate request body.
 *
 * @param body - request body.
 * @param schema - JOI schema.
 * @param next - Express next function.
 * @returns if validation fails return message to the user.
 */
export function validate(
  body: any,
  schema: Joi.ObjectSchema<any>,
  next: NextFunction
) {
  const validation = schema.validate(body);
  if (validation.error) {
    next(new ErrorHandlers(validation.error.message, 400));
    return false;
  }
  return true;
}

/**
 * Hash Password.
 *
 * @param password - password to hash.
 * @returns returns hashed password.
 */
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 8);
}

/**
 * compare password.
 *
 * @param password - password to compare.
 * @param hashedPassword - hashed to compare.
 * @returns boolean true/false.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return await bcrypt.compare(password, hashedPassword);
}

// Haversine formula to calculate distance between two coordinates in meters
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
