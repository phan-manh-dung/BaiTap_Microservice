const PaymentRouter = require('./PaymentRouter');
const routes = (app) => {
  app.use('/api/payment', PaymentRouter);
};

module.exports = routes;
