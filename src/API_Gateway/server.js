const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const serviceRegistry = require('./src/services/serviceRegistry');
const path = require('path');
const app = express();
require('dotenv').config();

// Routes
const userRoutes = require('./src/routes/userRouter');
const productRoutes = require('./src/routes/productRouter');
const orderRoutes = require('./src/routes/orderRouter');
const cartRoutes = require('./src/routes/cartRouter');
const paymentRoutes = require('./src/routes/paymentRouter');

// Rate limiting nếu vượt quá nó báo lỗi To many request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // request
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!',
    error: err.message,
  });
});

app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);

// Đăng ký API Gateway cho các service
serviceRegistry.register({
  name: 'api-gateway',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 5555,
  endpoints: ['/api/user/*', '/api/product/*', '/api/order/*', '/api/cart/*', '/api/payment/*'],
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Service Registry endpoint
app.post('/register', (req, res) => {
  try {
    const serviceId = serviceRegistry.register(req.body);
    res.json({ success: true, serviceId });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Theo dõi debug
app.get('/debug/services', (req, res) => {
  const servicesDebug = {};
  for (const [name, instances] of serviceRegistry.services) {
    servicesDebug[name] = Array.from(instances.values());
  }
  res.json({
    services: servicesDebug,
    timestamp: new Date().toISOString(),
  });
});

// hủy đăng ký service
app.post('/unregister/:serviceId', (req, res) => {
  const success = serviceRegistry.unregister(req.params.serviceId);
  res.json({ success });
});

// kiểm tra trạng thái service
app.post('/heartbeat/:serviceId', (req, res) => {
  const success = serviceRegistry.heartbeat(req.params.serviceId);
  res.json({ success });
});

app.get('/services', (req, res) => {
  const services = {};
  for (const [name, instances] of serviceRegistry.services) {
    services[name] = Array.from(instances.values());
  }
  res.json(services);
});

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
