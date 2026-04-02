import { io } from "socket.io-client";

export const intializeSocketConnect = (userId) => {
  const socket = io("http://localhost:4000", {
    withCredentials: true,
    auth: {
      userId,
    },
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server");
  });

  return socket;
};
