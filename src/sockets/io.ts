import { Server } from "socket.io";
import http from "http";
import { getDistance } from "@/libs";
import prisma from "@/libs/prisma";

interface DriverLocation {
  userId: string;
  lat: number;
  lon: number;
}

interface UserLocation {
  userId: string;
  lat: number;
  lon: number;
}

interface MarkerData {
  latitude: number;
  longitude: number;
  id: string | number;
  title: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: string | number;
  first_name: string;
  last_name: string;
  time?: number;
  price?: string;
  clerk_id: string;
}

export default function startSocket(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // In-memory store for driver locations keyed by socket id
  let driverLocations: Record<string, MarkerData> = {};

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);

    // Listen for location updates from drivers
    socket.on("driverLocationUpdate", async (data: DriverLocation) => {
      console.log(data);
      const driver = await prisma.users.findFirst({
        where: {
          clerk_id: data.userId,
        },
        include: {
          drivers: true,
        },
      });

      console.log(driver);

      const mapMarker: MarkerData = {
        car_image_url:
          "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
        car_seats: driver?.drivers?.car_seats!,
        first_name: driver?.first_name!,
        last_name: driver?.last_name!,
        id: driver?.clerk_id!,
        latitude: data.lat,
        longitude: data.lon,
        profile_image_url: driver?.drivers?.profile_image_url!,
        rating: Number(driver?.drivers?.rating)!,
        title: `${driver?.first_name} ${driver?.last_name}`,
        clerk_id: driver?.clerk_id!,
      };

      driverLocations[socket.id] = mapMarker;
      // Optionally broadcast to all connected clients
      console.log(driverLocations, "drivers");

      io.emit("driverLocation", data);
    });

    // Listen for user location requests

    socket.on("userLocation", (data: UserLocation) => {
      // console.log(data);
      const nearbyDrivers: MarkerData[] = [];
      Object.values(driverLocations).forEach((driver) => {
        if (driver.clerk_id !== data.userId) {

          const distance = getDistance(
            data.lat,
            data.lon,
            driver.latitude,
            driver.longitude
          );
          if (distance < 5000) {
            // within 5km radius
            nearbyDrivers.push(driver);
          }
        }
      })
      console.log(nearbyDrivers);
      socket.emit("nearbyDrivers", nearbyDrivers);
    });

    socket.on("disconnect", () => {
      delete driverLocations[socket.id];
      console.log("Client disconnected:", socket.id);
    });
  });
}
