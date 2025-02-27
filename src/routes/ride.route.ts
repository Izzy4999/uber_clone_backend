import { createRide, getRideByUserId } from "@/controller/ride.controller";
import { clerkMiddleware } from "@clerk/express";
import express from "express";

const rideRouter = express.Router();

rideRouter.get("/personal", clerkMiddleware(), getRideByUserId);
rideRouter.post("/", clerkMiddleware(), createRide);

export default rideRouter;
