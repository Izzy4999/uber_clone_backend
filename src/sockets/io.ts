import { Server } from "socket.io";
import http from "http";
import { getDistance } from "@/libs";

interface DriverLocation {
  driverId: string;
  lat: number;
  lon: number;
}

interface UserLocation {
  userId: string;
  lat: number;
  lon: number;
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
  let driverLocations: Record<string, DriverLocation> = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    console.log(driverLocations);

    // Listen for location updates from drivers
    socket.on("driverLocationUpdate", (data: DriverLocation) => {
      driverLocations[socket.id] = data;
      // Optionally broadcast to all connected clients
      io.emit("driverLocation", data);
    });

    // Listen for user location requests
    socket.on("userLocation", (data: UserLocation) => {
      const nearbyDrivers: DriverLocation[] = [];
      Object.values(driverLocations).forEach((driver) => {
        const distance = getDistance(
          data.lat,
          data.lon,
          driver.lat,
          driver.lon
        );
        if (distance < 5000) {
          // within 5km radius
          nearbyDrivers.push(driver);
        }
      });
      socket.emit("nearbyDrivers", nearbyDrivers);
    });

    socket.on("disconnect", () => {
      delete driverLocations[socket.id];
      console.log("Client disconnected:", socket.id);
    });
  });
}
