const axios = require('axios');
const OrderService = require('../service/OrderService');

const createOrder = async (req, res) => {
  try {
    const { userId, products, shippingPrice = 0, totalPrice, statusOrder = '', paymentMethod = '' } = req.body;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    let access_token = null;

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      access_token = authHeader.slice(7).trim();
    }
    if (!access_token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required in Authorization header',
      });
    }

    let userData;
    try {
      const userResponse = await axios.get(`${process.env.GATEWAY_URL}/api/user/get-detail/${userId}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      userData = userResponse.data;

      // Kiểm tra cấu trúc response từ API Gateway
      if (!userData || (!userData.data && !userData.success)) {
        throw new Error('Invalid response structure from user API');
      }

      // API Gateway có thể trả về { success: true, data: {...} }
      userData = userData.success ? userData.data : userData;
    } catch (error) {
      console.log('er', error);
      console.error(`Error fetching user: ${error.message}`);
      return res.status(404).json({ message: 'User not found from API' });
    }

    // Check user and get address
    const user = userData.data;
    const userAddress = user.address && user.address.length > 0 ? user.address[0] : null;

    const customerInformation = [];
    const shippingAddress = [];
    if (!userData) {
      return res.status(404).json({ message: 'User not found controller' });
    } else if (!user?.phone && !userAddress) {
      return res.status(404).json({ message: 'Phone and address not found controller' });
    } else if (!user?.phone) {
      return res.status(404).json({ message: 'Phone not found controller' });
    } else if (!userAddress) {
      return res.status(400).json({ message: 'User has no address' });
    } else if (!statusOrder || !paymentMethod) {
      return res.status(400).json({ message: 'Status Order or payment method is required' });
    } else {
      customerInformation.push({
        name: user?.name,
        phone: user?.phone,
      });
      shippingAddress.push({
        ward: userAddress?.ward,
        district: userAddress?.district,
        city: userAddress?.city,
        country: userAddress?.country,
      });
    }

    // Kiểm tra totalPrice từ request
    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice <= 0) {
      return res.status(400).json({ message: 'Total price is required and must be a positive number' });
    }

    // Tạo order details (không tính lại totalPrice)
    const orderDetails = [];
    let orderDetailIdCounter = 1;

    // Sử dụng Promise.all để gọi API song song
    const productPromises = products.map((item) =>
      axios.get(`${process.env.GATEWAY_URL}/api/product/product/get-by-id/${item.productId}`),
    );
    const productResponses = await Promise.all(productPromises);

    // Xử lý dữ liệu từ các response
    productResponses.forEach((productResponse, index) => {
      const productData = productResponse;
      if (!productData || !productData.data) {
        throw new Error(`Product ${products[index].productId} not found`);
      }
      const product = productData.data;

      // Tính totalItemPrice để hiển thị trong orderDetails (không ảnh hưởng đến totalPrice)
      const totalItemPrice = (totalPrice - shippingPrice) / products.length; // Chia đều cho các sản phẩm

      orderDetails.push({
        order_detail_id: orderDetailIdCounter++,
        name: product.name,
        amount: products[index].quantity,
        image: product.image,
        productId: products[index].productId,
        discount: products[index].discount || 0,
        color: product.color || null,
        total_price: totalItemPrice, // Giá hiển thị, không dùng để tính totalPrice
      });
    });

    // Tạo order với totalPrice từ request
    const response = await OrderService.createOrder(
      userId,
      customerInformation,
      shippingAddress,
      orderDetails,
      totalPrice, // Sử dụng totalPrice từ request
      statusOrder,
      paymentMethod,
    );

    // Kiểm tra response từ service
    if (response.status !== 200) {
      return res.status(response.status).json({ message: response.message });
    }

    // Nếu paymentMethod là MOMO, gửi message đến Kafka
    if (paymentMethod.toUpperCase() === 'MOMO') {
      const producer = req.app.locals.producer; // Lấy producer từ app.locals
      const orderData = {
        orderId: response?.data?._id.toString(),
        userId,
        amount: totalPrice, // Sử dụng totalPrice từ request
        orderInfo: `Thanh toán đơn hàng ${response?.data?._id}`,
      };

      try {
        await producer.send({
          topic: 'order-payment',
          messages: [
            {
              value: JSON.stringify(orderData),
            },
          ],
        });
        console.log('Order sent to Kafka:', orderData);
      } catch (kafkaError) {
        console.error('Error sending to Kafka:', kafkaError);
        // Có thể thêm logic rollback nếu cần (ví dụ: xóa đơn hàng vừa tạo)
      }
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error('Error in createOrder controller:', e.message);
    return res.status(500).json({
      message: e.message || 'Internal server error',
    });
  }
};

const getDetailOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId is required',
      });
    }
    const response = await OrderService.getOrderDetail(orderId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const data = await OrderService.getAllOrder();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteOrderToCancelled = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The orderId is required',
      });
    }
    const response = await OrderService.deleteOrderToCancelled(orderId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllOrderOfUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const statusOrder = req.query.statusOrder || '';

    if (!userId) {
      return res.status(400).json({
        status: 'ERR',
        message: 'The userId is required',
      });
    }

    const response = await OrderService.getAllOrderOfUser(userId, statusOrder);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: e,
    });
  }
};

const updateStatusOrder = async (req, res) => {
  try {
    const { orderId, statusOrder } = req.body;

    if (!orderId || !statusOrder) {
      return res.status(400).json({ message: 'orderId and statusOrder are required' });
    }

    const result = await OrderService.updateStatusOrder(orderId, statusOrder);
    res.status(result.status).json({ message: result.message, data: result.data });
  } catch (error) {
    console.error('Error in updateStatusOrder controller:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getDetailOrder,
  getAllOrder,
  deleteOrderToCancelled,
  getAllOrderOfUser,
  updateStatusOrder,
};
