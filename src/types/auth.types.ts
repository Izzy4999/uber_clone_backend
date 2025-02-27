import { Request } from "express";

export type ExtendedReq = Request & {
  user?: any;
  // file?: Express.Multer.File;
  // files: Express.Multer.File[];
};
