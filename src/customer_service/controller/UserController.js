const UserService = require('../service/UserService');
const JwtServices = require('../service/JwtServices');
const { readData, createData, deleteData, updateData } = require('../redis/v1/service/redisService');

const createUser = async (req, res) => {
  try {
    const { name, password, confirmPassword } = req.body;
    if (!name) {
      return res.status(200).json({
        status: 'ERR_NAME',
        message: 'Name is required',
      });
    }
    if (!password) {
      return res.status(200).json({
        status: 'ERR_PASSWORD',
        message: 'Password is required',
      });
    }
    if (!confirmPassword) {
      return res.status(200).json({
        status: 'ERR_CONFIRM_PASSWORD',
        message: 'Confirm password is required',
      });
    }
    if (password !== confirmPassword) {
      return res.status(200).json({
        status: 'ERR_CONFIRM_PASSWORD',
        message: 'Password and confirm password do not match',
      });
    }
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name && !password) {
      return res.status(200).json({
        status: 'ERR_ALL',
        message: 'Both name and password are required',
      });
    } else if (!name) {
      return res.status(200).json({
        status: 'ERR_NAME',
        message: 'Name is required',
      });
    } else if (!password) {
      return res.status(200).json({
        status: 'ERR_PASSWORD',
        message: 'Password is required',
      });
    }
    const response = await UserService.loginUser(req.body);
    const { refresh_token, ...newResponse } = response;
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });
    return res.status(200).json({ ...newResponse, refresh_token }); // lưu ý refresh token ở đây
  } catch (e) {
    console.error('Error in loginUser:', e);
    return res.status(500).json({
      message: e.message || 'Internal Server Error',
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The token is required',
      });
    }
    const response = await JwtServices.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId do not exist delete',
      });
    }
    const response = await UserService.deleteUser(userId); // nếu k rơi vào trường hợp nào thì cho
    //userId qua thằng UserService
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const logUotUser = async (req, res) => {
  try {
    res.clearCookie('refresh_token');
    return res.status(200).json({
      status: 'OK',
      message: 'Log out success',
    });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    console.log('data controller', data);
    if (!userId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId do not exist',
      });
    }
    const cacheKey = `user-detail:${userId}`;
    // Xóa cache cũ trước khi cập nhật (nếu có)
    // Bỏ qua lỗi nếu key không tồn tại
    await deleteData(cacheKey).catch(() => null);
    console.log(`Cache deleted for key: ${cacheKey}`);

    const response = await UserService.updateUser(userId, data);
    // Nếu cập nhật thành công, ghi đè dữ liệu mới vào cache
    if (response.status === 'OK') {
      await updateData(cacheKey, response, 3600);
      console.log(`Cache updated for key: ${cacheKey}`);
    }
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The userId do not exist getDetail',
      });
    }
    const cacheKey = `user-detail:${userId}`;
    const cachedData = await readData(cacheKey).catch(() => null);
    if (cachedData) {
      return res.status(200).json(cachedData); // Trả về dữ liệu từ cache
    }
    // nếu không có cache thì gọi vào db để lấy data
    const response = await UserService.getDetailsUser(userId);
    // lấy xong và tạo cache
    if (response.status === 'OK') {
      await createData(cacheKey, response, 3600);
      console.log(`Cache created for key: ${cacheKey}`);
    }
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  getAllUser,
  deleteUser,
  logUotUser,
  updateUser,
  getDetailsUser,
};
