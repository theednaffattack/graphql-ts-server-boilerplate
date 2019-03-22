import { startServer } from "./startServer";

try {
  startServer();
} catch (error) {
  console.error(error.message);
}
