const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const router = require('./routes');
const app = express();

dotenv.config();

app.use(express.json());

const SERVICE_INFO = {
  name: 'product_service',
  // host: 'localhost',
  host: 'product_service',
  port: process.env.PORT || 5002,
  endpoints: [
    '/api/product/get-all',
    '/api/product/get-by-id/:id',

    //----------------------------------------
    '/api/category/get-all',
    '/api/category/get-by-id/:id',
    '/api/supplier/get-all',
    '/api/supplier/get-by-id/:id',
    '/api/inventory/get-all',
    '/api/inventory/get-by-id/:id',

    //Create with auth  Admin-------------------
    '/api/product/admin/create',
    '/api/category/admin/create',
    '/api/supplier/admin/create',
    '/api/inventory/admin/create',

    //Update with auth Admin-------------------
    '/api/product/admin/update/:id',
    '/api/supplier/admin/update/:id',
    '/api/category/admin/update/:id',
    '/api/inventory/admin/update/:id',

    //Delete with auth Admin-------------------
    '/api/product/admin/delete/:id',
    '/api/supplier/admin/delete/:id',
    '/api/category/admin/delete/:id',
    '/api/inventory/admin/delete/:id',
  ],
};

// const GATEWAY_URL = 'http://localhost:5555';

let serviceId = null;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use(bodyParser.json());
app.use(cookieParser());
router(app);

// Register with API Gateway
async function registerWithGateway() {
  try {
    const response = await axios.post(`${process.env.GATEWAY_URL}/register`, SERVICE_INFO);
    serviceId = response.data.serviceId;
    console.log('Registered with API Gateway, serviceId:', serviceId);
    startHeartbeat();
  } catch (error) {
    console.error('Failed to register with API Gateway:', error.message);
    // Thử lại sau 5 giây
    setTimeout(registerWithGateway, 5000);
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

mongoose
  .connect(`${process.env.mongoURI}`)
  .then(() => {
    console.log('Connect to Database success');
  })
  .catch(() => {
    console.log('Connect database ERROR');
  });

// Start server
app.listen(SERVICE_INFO.port, () => {
  console.log(`Product Service running on http://localhost:${SERVICE_INFO.port}`);
  setTimeout(registerWithGateway, 1000);
});
