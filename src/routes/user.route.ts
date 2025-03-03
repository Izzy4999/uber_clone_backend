import {
  becomeDriver,
  driverApproval,
  registerUser,
  updateUser,
} from "@/controller/user.controller";
import { requireAuth } from "@clerk/express";
import express from "express";

const userRouter = express.Router();

userRouter.post("/", registerUser);
userRouter.put("/user/me", requireAuth(), updateUser);
userRouter.put("/user/driver", requireAuth(), becomeDriver);
userRouter.post("/drivers/approval", requireAuth(), driverApproval);

export default userRouter;
