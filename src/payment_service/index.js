// const http = require('http');
const router = require("./router");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const { Kafka } = require("kafkajs");

// Cấu hình Kafka
const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9092"],
  //brokers: ['kafka:9092'],
});
const consumer = kafka.consumer({ groupId: "payment-group" });

// Kết nối consumer và lắng nghe message
const connectConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "order-payment", fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const orderData = JSON.parse(message.value.toString());
        console.log("Received order from Kafka:", orderData);

        // Xử lý thanh toán với MoMo (gọi API create-payment)
        await processMoMoPayment(orderData);
      },
    });
    console.log("Kafka Consumer connected");
  } catch (error) {
    console.error("Error connecting Kafka Consumer:", error);
  }
};
connectConsumer();

// Hàm xử lý thanh toán MoMo (sẽ gọi API create-payment)
const processMoMoPayment = async (orderData) => {
  try {
    // Gọi API create-payment trong payment_service
    const response = await fetch(
      "http://localhost:5555/api/payment/create-payment-momo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      }
    );
    const result = await response.json();
    console.log("MoMo payment created:", result);
  } catch (error) {
    console.error("Error processing MoMo payment:", error);
  }
};

dotenv.config();
const app = express();
// Thêm middleware để parse JSON
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"], // Thêm 'OPTIONS' để hỗ trợ preflight request
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Nếu có dùng cookies hoặc token
  })
);

const SERVICE_INFO = {
  name: "payment_service",
  //  host: "payment_service",
  host: "localhost",
  port: process.env.PORT_PAYMENT_SERVICE || 6005,
  endpoints: [
    "/api/payment/create-payment-momo",
    "/api/payment/callback",
    "/api/payment/status",
    "api/payment/transaction-status-momo",
  ],
};

let serviceId = null;

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
  await consumer.disconnect();
  console.log("Kafka Consumer disconnected");
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

// Middleware để truyền io vào req
app.use((req, res, next) => {
  next();
});

router(app);

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log("Connect to Database success");
  })
  .catch(() => {
    console.log("Connect database ERROR");
  });

// port 4000
app.listen(SERVICE_INFO.port, () => {
  console.log(`Cart Service running on http://localhost:${SERVICE_INFO.port}`);
  setTimeout(registerWithGateway, 1000);
});

module.exports = { app };
