import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { ErrorMiddleWare } from "@/middleware/error";
import env from "@/utils/env";
import userRouter from "@/routes/user.route";
import rideRouter from "@/routes/ride.route";
import http from "http";
import startSocket from "@/sockets/io";

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(express.json());

startSocket(server);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use("/api/users", userRouter);
app.use("/api/rides", rideRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello, World!",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(
    `Route: ${req.method} ${req.originalUrl} not found`
  ) as any;
  err.statusCode = 404;
  next(err);
});
app.use(ErrorMiddleWare);

// Start the server
const PORT = env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
