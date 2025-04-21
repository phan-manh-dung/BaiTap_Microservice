const redisClient = require('../init/redisClient');

// 1. Create - Lưu một object vào Redis
async function createData(key, data, expiration = 3600) {
  try {
    const value = JSON.stringify(data);
    // Lưu vào Redis với thời gian hết hạn TTL
    await redisClient.setEx(key, expiration, value);
    console.log(`Data saved with key: ${key}`);
    return true;
  } catch (err) {
    console.error('Error in createData:', err);
    throw err;
  }
}

// 2. Read - Lấy dữ liệu từ Redis
async function readData(key) {
  try {
    const data = await redisClient.get(key);
    if (!data) {
      console.log(`No data found for key: ${key}`);
      return null;
    }
    // Parse chuỗi JSON về object
    return JSON.parse(data);
  } catch (err) {
    console.error('Error in readData:', err);
    throw err;
  }
}

// 3. Update - Cập nhật object trong Redis
async function updateData(key, newData, expiration = 3600) {
  try {
    // Ghi đè dữ liệu cũ với dữ liệu mới
    const value = JSON.stringify(newData);
    await redisClient.setEx(key, expiration, value);
    console.log(`Data updated for key: ${key}`);
    return true;
  } catch (err) {
    console.error('Error in updateData:', err);
    throw err;
  }
}

// 4. Delete - Xóa object khỏi Redis
async function deleteData(key) {
  try {
    const result = await redisClient.del(key);
    if (result === 1) {
      console.log(`Data deleted for key: ${key}`);
      return true;
    } else {
      console.log(`No data found to delete for key: ${key}`);
      return false;
    }
  } catch (err) {
    console.error('Error in deleteData:', err);
    throw err;
  }
}

module.exports = {
  createData,
  readData,
  updateData,
  deleteData,
};
