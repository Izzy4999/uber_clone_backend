import { DefaultEventsMap, Server } from "socket.io";
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
  socketId?: string;
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

interface Ride {
  passengerId: string;
  destLat: number;
  destLon: number;
  currentLon: number;
  currentLang: number;
}

export default function startSocket(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // In-memory store for driver locations keyed by socket id
  let driverLocations: Record<string, MarkerData> = {};
  let userLocations: Record<string, UserLocation> = {};

  io.on("connection", (socket) => {
    socket.on("driverLocationUpdate", async (data: DriverLocation) => {
      // console.log(data);
      const driver = await prisma.users.findFirst({
        where: {
          clerk_id: data.userId,
        },
        include: {
          drivers: true,
        },
      });

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

      // 🔥 **Notify each user about their nearby drivers**
      Object.values(userLocations).forEach((user) => {
        const nearbyDrivers = getNearbyDrivers(user, driverLocations);
        // console.log(nearbyDrivers, "near", user.userId);
        io.to(user?.socketId!).emit("nearbyDrivers", nearbyDrivers); // Send only to that user
      });

      io.emit("driverLocation", data);
    });

    // Listen for user location requests

    socket.on("userLocation", (data: UserLocation) => {
      userLocations[socket.id] = { ...data, socketId: socket.id };

      const filteredDrivers = getNearbyDrivers(data, driverLocations);

      // console.log(filteredDrivers, "nearbyDrivers");
      socket.emit("nearbyDrivers", filteredDrivers);
    });

    socket.on("rideRequest", async (data: Ride) => {
      console.log(data);
      console.log(driverLocations);
      const nearbyDrivers = getNearbyDrivers(
        {
          lon: data?.currentLon,
          lat: data?.currentLang,
          userId: data?.passengerId,
        },
        driverLocations
      );

      console.log(nearbyDrivers, "nearby");

      const clerkIds = nearbyDrivers.map((driver) => driver.clerk_id);
      console.log(clerkIds, "ids");

      const sockets = getSocketIdsByClerkIds(clerkIds, driverLocations);

      const user = await prisma.users.findFirst({
        where: { clerk_id: data.passengerId },
      });

      if (!user) {
        return;
      }

      if (sockets.length === 0) {
        io.to(socket.id).emit("rideRequestResponse", {
          status: false,
          message: "No nearby drivers available",
        });
        return;
      }

      sendEventToDrivers(
        sockets,
        "new-ride-request",
        { message: "New Ride Request", user: user },
        io
      );
    });

    socket.on("disconnect", () => {
      delete driverLocations[socket.id];
      console.log("Client disconnected:", socket.id);
    });
  });
}

function getNearbyDrivers(
  user: UserLocation,
  driverLocations: Record<string, MarkerData>
): MarkerData[] {
  return Object.values(driverLocations).filter((driver) => {
    if (driver.clerk_id !== user.userId) {
      const distance = getDistance(
        user.lat,
        user.lon,
        driver.latitude,
        driver.longitude
      );
      return distance < 5000; // Only drivers within 5km
    }
    return false;
  });
}

const getSocketIdsByClerkIds = (
  clerkIds: string[],
  driverSockets: Record<string, MarkerData>
) => {
  const socketIds = [];

  for (const [socketId, data] of Object.entries(driverSockets)) {
    if (clerkIds.includes(data.clerk_id)) {
      socketIds.push(socketId);
    }
  }

  return socketIds;
};

const sendEventToDrivers = (
  socketIds: string[],
  event: string,
  data: any,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, data);
  });
};
