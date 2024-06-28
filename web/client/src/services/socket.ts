import { io } from "socket.io-client";
import getLogger from "../utils/logger";

const logger = getLogger("socket");
const socket = io("/");

socket.on("connect", () => {
  logger.log(`socket Connected`);
});

socket.on("disconnect", () => {
  logger.log(`socket Disconnected`);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("connect_timeout", (timeout) => {
  console.error("Socket connection timeout:", timeout);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});
export default socket;
