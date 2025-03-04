import ErrorHandlers from "@/libs/errorHandler";
import prisma from "@/libs/prisma";
import { CatchAsyncError } from "@/middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { clerkClient, getAuth } from "@clerk/express";

const validateSchema = Joi.object({
  // name: Joi.string().required(),
  email: Joi.string().email().required(),
  clerk_id: Joi.string().required(),
});

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = validateSchema.validate(req.body);
      if (validation.error) {
        return next(
          new ErrorHandlers(validation.error.details[0].message, 400)
        );
      }

      const user = await prisma.users.create({
        data: {
          email: req.body.email,
          clerk_id: req.body.clerk_id,
        },
      });

      return res.status(200).json({
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      return next(new ErrorHandlers(error.message, 500));
    }
  }
);

export const becomeDriver = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      if (!auth) {
        return next(new ErrorHandlers("Unauthorized", 401));
      }

      const {
        carMake,
        carModel,
        carYear,
        plate,
        carColor,
        carSeats,
        carImage,
      } = req.body;
      if (
        !carModel ||
        !carMake ||
        !carYear ||
        !plate ||
        !carColor ||
        !carSeats ||
        !carImage
      ) {
        return next(new ErrorHandlers("All fields are required", 400));
      }

      const clerkUser = await clerkClient.users.getUser(auth.userId!);

      const user = await prisma.users.findFirst({
        where: { clerk_id: auth.userId! },
      });

      if (!user) {
        return next(new ErrorHandlers("User not found", 404));
      }

      const driverApplied = await prisma.drivers.findFirst({
        where: { user_id: user?.id },
      });

      if (driverApplied) {
        return next(
          new ErrorHandlers("Driver application already exists", 400)
        );
      }
      const driver = await prisma.drivers.create({
        data: {
          car_seats: Number(carSeats),
          plate_number: plate,
          car_color: carColor,
          car_image_url: carImage,
          car_make: carMake,
          car_model: carModel,
          car_year: Number(carYear),
          user_id: user?.id,
          profile_image_url: clerkUser?.imageUrl,
        },
      });

      await clerkClient.users.updateUser(auth.userId!, {
        publicMetadata: {
          driverStatus: "pending",
        },
      });

      return res.status(200).json({
        message: "User successfully applied to be driver",
        data: driver,
      });
    } catch (error: any) {
      return next(new ErrorHandlers(error.message, 500));
    }
  }
);

export const updateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      if (!auth) {
        return next(new ErrorHandlers("Unauthorized", 401));
      }

      const user = await prisma.users.findFirst({
        where: { clerk_id: auth.userId! },
      });

      if (!user) {
        return next(new ErrorHandlers("User not found", 404));
      }

      const clerkUser = await clerkClient.users.getUser(auth.userId!);

      // console.log(clerkUser);

      const updateUser = await prisma.users.update({
        where: { id: user?.id },
        data: {
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          phone: clerkUser.unsafeMetadata.phoneNumber!,
          ...(clerkUser.imageUrl && { profile_image_url: clerkUser.imageUrl }),
        },
      });

      return res.status(200).json({
        message: "User updated successfully",
        data: updateUser,
      });
    } catch (error: any) {
      return next(new ErrorHandlers(error.message, 500));
    }
  }
);

export const driverApproval = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      if (!auth) {
        return next(new ErrorHandlers("Unauthorized", 401));
      }

      const user = await clerkClient.users.getUser(auth.userId!);
      if (user?.publicMetadata?.role !== "admin") {
        return next(new ErrorHandlers("Unauthorized", 403));
      }

      const { driver_id, status, reason } = req.body;
      if (!driver_id || !status) {
        return next(new ErrorHandlers("Missing required fields", 400));
      }

      if (status === "denied" && !reason) {
        return next(new ErrorHandlers("Reason for denial is required", 400));
      }

      const driver = await prisma.drivers.findFirst({
        where: { id: driver_id },
        include: {
          User: true,
        },
      });

      if (!driver) {
        return next(new ErrorHandlers("Driver not found", 404));
      }

      await clerkClient.users.updateUser(driver!.User.clerk_id, {
        publicMetadata: {
          driverStatus: status,
          role: "driver",
        },
      });

      await prisma.drivers.update({
        where: { id: driver_id },
        data: {
          approved: status,
          ...(reason && { reason }),
        },
      });

      return res.status(200).json({
        message: `Driver status updated to ${status}`,
        data: driver,
      });
    } catch (error: any) {
      return next(new ErrorHandlers(error.message, 500));
    }
  }
);
