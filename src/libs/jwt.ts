import jwt from "jsonwebtoken";
import { Response } from "express";
import env from "@/utils/env";

export interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accessTokenExpire = parseInt(env.ACCESS_TOKEN_EXPIRE, 10);
const refreshTokenExpire = parseInt(env.REFRESH_TOKEN_EXPIRE, 10);

export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};
export const refreshTokenOpitons: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

/**
 * 
 * @param user user object
 * @param statusCode http status code
 * @param res express response
 * 
 * @return response
 */
export const sendToken = (user: any, statusCode: number, res: Response) => {
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  res.cookie("refresh_token", refreshToken, refreshTokenOpitons);
  res.cookie("access_token", accessToken, accessTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};

export const signAccessToken = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    env.ACCESS_TOKEN,
    {
      expiresIn: "10h",
    }
  );
};

export const signRefreshToken = (id: string) => {
  return jwt.sign(
    {
      id,
    },
    env.REFRESH_TOKEN,
    {
      expiresIn: "3d",
    }
  );
};
