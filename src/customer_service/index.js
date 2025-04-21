const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const router = require("./router");
const app = express();

dotenv.config();

app.use(express.json());

const SERVICE_INFO = {
  name: "user_service",
  host: "localhost",
  // host: 'user_service',
  port: process.env.PORT || 5001,
  endpoints: [
    "/api/user/sign-in",
    "/api/user/sign-up",
    "/api/user/admin/get-all",
    "/api/user/get-detail/:id",
    "/api/user/admin/delete-user/:id",
    "/api/user/update-user/:",
    "/refresh-token",
    "/log-out",
    "/api/user/verify-token",
  ],
};

let serviceId = null;
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(bodyParser.json());
app.use(cookieParser());
router(app);

// Register with API Gateway
async function registerWithGateway() {
  try {
    const response = await axios.post(
      `${process.env.GATEWAY_URL}/register`,
      SERVICE_INFO
    );
    serviceId = response.data.serviceId;
    console.log("Registered with API Gateway, serviceId:", serviceId);
    startHeartbeat();
  } catch (error) {
    console.error("Failed to register with API Gateway:", error.message);
    // Thử lại sau 4 giây
    setTimeout(registerWithGateway, 4000);
  }
}

// Heartbeat
function startHeartbeat() {
  setInterval(async () => {
    try {
      await axios.post(`${process.env.GATEWAY_URL}/heartbeat/${serviceId}`);
    } catch (error) {
      console.error("Heartbeat failed:", error.message);
      // Thử đăng ký lại nếu heartbeat thất bại
      serviceId = null;
      registerWithGateway();
    }
  }, 60000);
}

// Graceful shutdown
process.on("SIGINT", async () => {
  if (serviceId) {
    try {
      await axios.post(`${process.env.GATEWAY_URL}/unregister/${serviceId}`);
      console.log("Unregistered from API Gateway");
    } catch (error) {
      console.error("Failed to unregister:", error.message);
    }
  }
  process.exit(0);
});

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect to Database success");
  })
  .catch(() => {
    console.log("Connect database ERROR");
  });

// Start server
app.listen(SERVICE_INFO.port, () => {
  console.log(`User Service running on http://localhost:${SERVICE_INFO.port}`);
  setTimeout(registerWithGateway, 2000);
});
