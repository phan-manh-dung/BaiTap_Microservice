const { Order } = require('../model/OrderModel');
const mongoose = require('mongoose');

const { readData, updateData, deleteData } = require('../redis/v1/service/redisService');

const createOrder = (
  userId,
  customerInformation,
  shippingAddress,
  orderDetails,
  totalPrice,
  statusOrder,
  paymentMethod,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !userId ||
        !customerInformation ||
        !shippingAddress ||
        !orderDetails ||
        !totalPrice ||
        !statusOrder ||
        !paymentMethod
      ) {
        return resolve({
          status: 400,
          message: 'Missing required fields',
        });
      }

      // Kiểm tra totalPrice hợp lệ
      if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
        return resolve({
          status: 400,
          message: 'Total price is required and must be a positive number',
        });
      }

      const newOrder = new Order({
        userId,
        customerInformation,
        shippingAddress,
        orderDetails,
        totalPrice,
        statusOrder: statusOrder || 'pending',
        paymentMethod: paymentMethod || 'CASH',
      });

      await newOrder.save();

      // Xử lý Redis
      const cacheKey = `cart-all-one-user:${userId}:${statusOrder}`;
      const cachedData = await readData(cacheKey).catch((err) => {
        console.error('Error reading Redis:', err);
        return null;
      });

      if (cachedData && cachedData.data) {
        let updatedOrders = cachedData.data.orders || cachedData.data;
        if (Array.isArray(updatedOrders)) {
          updatedOrders.push(newOrder.toObject());
        } else {
          updatedOrders = [updatedOrders, newOrder.toObject()];
        }

        try {
          await updateData(
            cacheKey,
            {
              ...cachedData,
              data: {
                ...cachedData.data,
                orders: updatedOrders,
              },
            },
            3600,
          );
          console.log(`Cache updated for key: ${cacheKey}`);
        } catch (redisError) {
          console.error('Error updating Redis:', redisError);
        }
      } else {
        console.log('No cache found or invalid cache data, skipping update');
      }

      resolve({
        status: 200,
        message: 'Order created successfully',
        data: newOrder,
      });
    } catch (e) {
      console.error('Error in createOrder service:', e);
      reject({
        status: 500,
        message: 'Internal Server Error',
        error: e.message || e,
      });
    }
  });
};

const getOrderDetail = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findOne({
        _id: id,
      });
      if (order === null) {
        resolve({
          status: 'ERR',
          message: 'Id order is not defined',
        });
      }
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllOrder = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allOrder = await Order.find().sort({ createdAt: -1, updatedAt: -1 });
      resolve({
        status: 'OK',
        message: 'Success',
        data: allOrder,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteOrderToCancelled = async (id) => {
  try {
    const order = await Order.findById(id);
    if (!order) {
      return {
        status: 'ERR',
        message: 'Order does not exist',
      };
    }

    if (order.statusOrder === 'cancelled') {
      return {
        status: 'ERR',
        message: 'Order is already cancelled',
      };
    }

    const oldStatus = order.statusOrder;
    order.statusOrder = 'cancelled';
    await order.save();

    const userId = order.userId.toString();
    const pendingCacheKey = `cart-all-one-user:${userId}:${oldStatus}`;
    const cancelledCacheKey = `cart-all-one-user:${userId}:cancelled`;

    // Cập nhật cache pending
    const cachedPendingData = await readData(pendingCacheKey).catch((err) => {
      console.error(`Error reading Redis for ${pendingCacheKey}:`, err);
      return null;
    });

    if (cachedPendingData && cachedPendingData.data) {
      let updatedPendingOrders = Array.isArray(cachedPendingData.data.orders)
        ? cachedPendingData.data.orders
        : cachedPendingData.data;
      updatedPendingOrders = updatedPendingOrders.filter((item) => item._id.toString() !== id);

      try {
        await updateData(
          pendingCacheKey,
          {
            status: 'OK',
            message: 'SUCCESS',
            data: {
              customerInformation: cachedPendingData.data.customerInformation,
              shippingAddress: cachedPendingData.data.shippingAddress,
              orders: updatedPendingOrders,
            },
          },
          3600,
        );
        console.log(`Cache updated for key: ${pendingCacheKey} with ${updatedPendingOrders.length} orders`);
      } catch (redisError) {
        console.error(`Error updating Redis for ${pendingCacheKey}:`, redisError);
      }
    }
    // Xóa cache cancelled
    try {
      await deleteData(cancelledCacheKey);
      console.log(`Cache deleted for key: ${cancelledCacheKey}`);
    } catch (redisError) {
      console.error(`Error deleting Redis cache for ${cancelledCacheKey}:`, redisError);
    }

    return {
      status: 'OK',
      message: 'Order cancelled successfully',
      data: order,
    };
  } catch (e) {
    throw e;
  }
};

const getAllOrderOfUser = (id, statusOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) {
        return resolve({
          status: 'ERR',
          message: 'User ID is required',
        });
      }
      // Tạo query object để tìm kiếm theo user và status (nếu có)
      let query = { userId: new mongoose.Types.ObjectId(id) };
      if (statusOrder) {
        query.statusOrder = statusOrder; // Thêm điều kiện lọc theo statusOrder
      }

      const order = await Order.find(query).sort({ createdAt: -1, updatedAt: -1 });
      if (!order || order.length === 0 || order === null) {
        resolve({
          status: 'ERR',
          message: 'No orders found',
        });
      } else {
        // Tạo response mới
        let responseData = {};
        // Nếu chỉ có 1 order, không cần kiểm tra trùng lặp
        if (order.length === 1) {
          responseData = order[0].toObject();
        } else {
          // Lấy order đầu tiên làm tham chiếu
          const firstOrder = order[0];
          // Kiểm tra trùng lặp mà không dùng JSON.stringify
          const isCustomerInfoSame = order.every((order) => {
            const firstInfo = firstOrder.customerInformation[0];
            const currentInfo = order.customerInformation[0];
            return firstInfo.name === currentInfo.name && firstInfo.phone === currentInfo.phone;
          });

          const isShippingAddressSame = order.every((order) => {
            const firstAddr = firstOrder.shippingAddress[0];
            const currentAddr = order.shippingAddress[0];
            return (
              firstAddr.ward === currentAddr.ward &&
              firstAddr.district === currentAddr.district &&
              firstAddr.city === currentAddr.city &&
              firstAddr.country === currentAddr.country
            );
          });

          // Tách dữ liệu trùng lặp ra ngoài
          if (isCustomerInfoSame) {
            responseData.customerInformation = firstOrder.customerInformation;
          }
          if (isShippingAddressSame) {
            responseData.shippingAddress = firstOrder.shippingAddress;
          }

          // Tạo danh sách orders đã loại bỏ các trường trùng lặp
          responseData.orders = order.map((order) => {
            const orderData = order.toObject();
            if (isCustomerInfoSame) delete orderData.customerInformation;
            if (isShippingAddressSame) delete orderData.shippingAddress;
            return orderData;
          });
        }

        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: responseData,
        });
      }
    } catch (e) {
      console.log('error', e);
      reject({
        status: 'ERR',
        message: 'An error occurred while fetching orders',
        error: e,
      });
    }
  });
};

const updateStatusOrder = (orderId, statusOrder) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra orderId và statusOrder
      if (!orderId || !statusOrder) {
        return resolve({
          status: 400,
          message: 'orderId and statusOrder are required',
        });
      }

      // Kiểm tra statusOrder hợp lệ
      const validStatuses = ['wait_pay', 'pending', 'deliver', 'completed', 'cancelled'];
      if (!validStatuses.includes(statusOrder)) {
        return resolve({
          status: 400,
          message: 'Invalid statusOrder value',
        });
      }

      // Tìm và update order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { statusOrder, updatedAt: new Date() },
        { new: true }, // Trả về document đã update
      );

      if (!updatedOrder) {
        return resolve({
          status: 404,
          message: 'Order not found',
        });
      }

      resolve({
        status: 200,
        message: 'Order status updated successfully',
        data: updatedOrder,
      });
    } catch (e) {
      console.error('Error in updateStatusOrder service:', e);
      reject({
        status: 500,
        message: 'Internal Server Error',
        error: e.message || e,
      });
    }
  });
};

module.exports = {
  createOrder,
  getOrderDetail,
  getAllOrder,
  deleteOrderToCancelled,
  getAllOrderOfUser,
  updateStatusOrder,
};
