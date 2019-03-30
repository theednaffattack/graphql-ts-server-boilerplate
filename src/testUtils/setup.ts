import { startServer } from "../startServer";
import { AddressInfo } from "net";

let app: any;

export const setup = async () => {
  app = await startServer();
  const { port } = (await app.address()) as AddressInfo;
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;

  // set to find unhandled promises, mostly for TypeORM;
  process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    // application specific logging, throwing an error, or other logic here
  });
};
