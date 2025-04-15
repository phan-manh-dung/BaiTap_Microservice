const router = require('./router');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');
dotenv.config();
const app = express();
// cấu hình kafka
const { Kafka } = require('kafkajs');

// Cấu hình Kafka
const kafka = new Kafka({
  clientId: 'order_service',
  // brokers: ['localhost:9092'], // Địa chỉ Kafka server
  brokers: ['kafka:9092'],
});
const producer = kafka.producer();

// Kết nối producer
const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka Producer connected');
  } catch (error) {
    console.error('Error connecting Kafka Producer:', error);
  }
};
connectProducer();
// Đưa producer vào app.locals để các router/controller có thể sử dụng
app.locals.producer = producer;

const SERVICE_INFO = {
  name: 'order_service',
  host: 'order_service',
  port: process.env.PORT || 5003,
  endpoints: [
    '/api/order/create-order',
    '/api/order/get-detail-order/:id',
    '/api/order/admin/get-all-order',
    '/api/order/cancel-order/:id',
    '/api/order/get-all-order-user/:id',
    '/api/order/update-status',
  ],
};

let serviceId = null;

// Register with API Gateway
async function registerWithGateway() {
  try {
    const response = await axios.post(`${process.env.GATEWAY_URL}/register`, SERVICE_INFO);
    serviceId = response.data.serviceId;
    console.log('Registered with API Gateway, serviceId:', serviceId);
    startHeartbeat();
  } catch (error) {
    console.error('Failed to register with API Gateway:', error.message);
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
      console.error('Heartbeat failed:', error.message);
      // Thử đăng ký lại nếu heartbeat thất bại
      serviceId = null;
      registerWithGateway();
    }
  }, 60000);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  // of kafka
  await producer.disconnect();
  console.log('Kafka Producer disconnected');
  if (serviceId) {
    try {
      await axios.post(`${process.env.GATEWAY_URL}/unregister/${serviceId}`);
      console.log('Unregistered from API Gateway');
    } catch (error) {
      console.error('Failed to unregister:', error.message);
    }
  }
  process.exit(0);
});

// Middleware để truyền io vào req
// app.use((req, res, next) => {
//   next();
// });

const PORT = process.env.PORT_ORDER_SERVICE || 5003;

app.use(bodyParser.json());
app.use(cors());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb' }));

app.use(cookieParser());

router(app);

mongoose
  .connect(`${process.env.MONGO_DB}`)
  .then(() => {
    console.log('Connect to Database success');
  })
  .catch(() => {
    console.log('Connect database ERROR');
  });

// port 4000
app.listen(SERVICE_INFO.port, () => {
  console.log(`Order Service running on http://localhost:${SERVICE_INFO.port}`);
  setTimeout(registerWithGateway, 1000);
});

module.exports = { app };
