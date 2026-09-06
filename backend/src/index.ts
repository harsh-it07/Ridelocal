import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`RideLocal API listening on http://localhost:${env.port}`);
  console.log("Payments running on the MOCK provider — no real gateway is called.");
});
