import ErrorHandlers from "@/libs/errorHandler";
import { ExtendedReq } from "@/types/auth.types";
import { NextFunction, Response } from "express";

// export const verifyToken = CatchAsyncError(
//   async (req: ExtendedReq, res: Response, next: NextFunction) => {
//     try {
//       const tokenheader = req.headers.authorization?.split("Bearer ")[1];
//       const token = req.cookies?.access_token;

//       if (!token && !tokenheader) {
//         return res.status(403).json({
//           message: "Login to access",
//           success: false,
//         });
//       }
//       const user = token
//         ? await jwt.verify(token, env.ACCESS_TOKEN)
//         : await jwt.verify(tokenheader!, env.ACCESS_TOKEN);

//       if (!user) {
//         return next(new ErrorHandlers("Invalid token", 401));
//       }

//       const checkStatus = await prisma.user.findFirst({
//         where: {
//           id: (user as any).id,
//         },
//       });

//       req.user = checkStatus;

//       next();
//     } catch (error: any) {
//       return next(new ErrorHandlers(error.message, 401));
//     }
//   }
// );


export const authorizedRoles = (...roles: string[]) => {
  return (req: ExtendedReq, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandlers(
          `Role: ${req.user?.role} is not allowed to access this  resource`,
          403
        )
      );
    }
    next();
  };
};
