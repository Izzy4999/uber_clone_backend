import ErrorHandlers from "@/libs/errorHandler";
import prisma from "@/libs/prisma";
import { CatchAsyncError } from "@/middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const createRide = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      console.log(auth);
      const {
        origin_address,
        destination_address,
        origin_latitude,
        origin_longitude,
        destination_latitude,
        destination_longitude,
        ride_time,
        fare_price,
        payment_status,
        driver_id,
        user_id,
      } = req.body;

      if (
        !origin_address ||
        !destination_address ||
        !origin_latitude ||
        !origin_longitude ||
        !destination_latitude ||
        !destination_longitude ||
        !ride_time ||
        !fare_price ||
        !payment_status ||
        !driver_id ||
        !user_id
      ) {
        return next(new ErrorHandlers("Missing required fields", 400));
      }

      //   const result = await prisma.rides.create({
      //     data: {
      //       destination_address,
      //       destination_latitude,
      //       destination_longitude,
      //       ride_time,
      //       fare_price,
      //       payment_status,
      //       origin_address,
      //       origin_latitude,
      //       origin_longitude,
      //       driver_id,
      //       user_id,
      //     },
      //   });
    } catch (error: any) {
      return next(new ErrorHandlers(error.message, 500));
    }
  }
);

export const getRideByUserId = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const result = await prisma.rides.findFirst({
        where: {
          user_id: auth.userId!,
        },
        include: {
          drivers: true,
        },
      });

      return res.status(200).json({
        ride: result,
      });
    } catch (error: any) {
      return next(new ErrorHandlers(error.message, 500));
    }
  }
);