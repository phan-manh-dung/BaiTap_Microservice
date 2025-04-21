const crypto = require('crypto');
const axios = require('axios');
const Transaction = require('../model/transactionModel');
const Webhook = require('../model/webhookModel');

// Thông tin MoMo
const partnerCode = 'MOMO' || process.env.MOMO_PARTNER_CODE;
const accessKey = 'F8BBA842ECF85' || process.env.MOMO_ACCESS_KEY;
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz' || process.env.MOMO_SECRET_KEY;
const ipnUrl =
  'https://0064-2001-ee0-5006-50a0-b003-5ba0-7840-9e64.ngrok-free.app/api/payment/callback' || process.env.MOMO_IPN_URL;
// thanh toán xong nó sẽ trở về đây
const redirectUrl = 'https://webhook.site/cb7c3ef2-df12-482d-97bf-f76b1a4ead27' || process.env.MOMO_REDIRECT_URL;
const requestType = 'captureWallet';

function generateSignature(requestBody) {
  const rawSignature = Object.keys(requestBody)
    .sort()
    .map((key) => `${key}=${requestBody[key]}`)
    .join('&');
  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
}

const createPayment = async ({ amount, orderInfo, orderId }) => {
  const requestId = `request_${Date.now()}`;
  const extraData = '';

  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
  };
  requestBody.signature = generateSignature(requestBody);

  // Lưu giao dịch vào DB
  await Transaction.create({ orderId, amount, orderInfo });

  const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
  return { qrCodeUrl: response.data.qrCodeUrl, payUrl: response.data.payUrl };
};

const handleCallback = async (data) => {
  try {
    await Webhook.create({
      orderId: data.orderId,
      requestId: data.requestId,
      resultCode: data.resultCode,
      message: data.message,
      transId: data.transId,
    });
    const status = data.resultCode === 0 ? 'SUCCESS' : 'FAILED';
    await Transaction.updateOne({ orderId: data.orderId }, { status, updatedAt: new Date() });
    // Nếu thanh toán thành công, gọi API update-status của order_service
    if (data.resultCode === 0) {
      try {
        await axios.put('http://api-gateway:5555/api/order/update-status', {
          orderId: data.orderId,
          statusOrder: 'completed',
        });
        console.log(`Updated statusOrder for order ${data.orderId} to completed`);
      } catch (error) {
        console.error(`Error updating order status for order ${data.orderId}:`, error.message);
      }
    }
  } catch (error) {
    console.log('Error saving webhook:', error);
  }
};

const checkTransactionStatus = async (orderId) => {
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${orderId}`;
  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode,
    requestId: orderId,
    orderId,
    signature,
  };

  const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', requestBody);
  return response.data;
};

module.exports = {
  createPayment,
  handleCallback,
  checkTransactionStatus,
};
