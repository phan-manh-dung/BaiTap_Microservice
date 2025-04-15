const OrderRouter = require('./OrderRouter');
const routes = (app) => {
  app.use('/api/order', OrderRouter);
};

module.exports = routes;
