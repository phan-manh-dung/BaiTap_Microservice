const { User, Account, Role } = require('../model/UserModel');
const bcrypt = require('bcryptjs');
const { generalAccessToken, refreshAccessToken } = require('../service/JwtServices');

const createUser = async (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, password } = newUser;
    try {
      const checkUser = await User.findOne({ name });
      if (checkUser) {
        return resolve({
          status: 'ERR_USER',
          message: 'The name user is already in use',
        });
      }

      const hash = bcrypt.hashSync(String(password), 10);

      // Tìm role CUSTOMER
      const customerRole = await Role.findOne({ name: 'CUSTOMER' });
      if (!customerRole) {
        return resolve({
          status: 'ERR',
          message: 'Role CUSTOMER does not exist',
        });
      }

      // **Tạo User trước**
      const user = new User({ name, password: hash });
      await user.save(); // Lưu user vào database

      // **Tạo Account với `user_id`**
      const account = new Account({
        account_id: Date.now(),
        user_id: user._id,
        roles: [{ _id: customerRole._id, name: customerRole.name }],
      });
      await account.save(); // Lưu account vào database

      // **Cập nhật User với Account**
      user.account = account._id;
      await user.save(); // Lưu lại user với account mới

      resolve({
        status: 'OK',
        message: 'User created successfully',
        data: user,
      });
    } catch (e) {
      console.error('Error in service:', e);
      reject(e);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { name, password } = userLogin;
    try {
      const checkUser = await User.findOne({ name }).populate('account');
      if (!checkUser) {
        return resolve({
          status: 'ERR USER NOT IN THE DATABASE',
          message: 'User is not in the database',
        });
      }

      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      if (!comparePassword) {
        return resolve({
          status: 'ERR_PASSWORD',
          message: 'The password is incorrect',
        });
      }

      const roles = checkUser.account?.roles?.map((role) => role.name) || [];

      const access_token = await generalAccessToken({
        id: checkUser.id,
        roles,
      });

      const refresh_token = await refreshAccessToken({
        id: checkUser.id,
      });

      resolve({
        status: 'OK',
        message: 'Success',
        userId: checkUser.id,
        access_token,
        refresh_token,
      });
    } catch (e) {
      console.error('Error in loginUser service:', e);
      reject(e);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      resolve({
        status: 'OK',
        message: 'Get all Success',
        data: allUser,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return resolve({
          status: 'ERR',
          message: 'The user does not exist',
        });
      }

      if (user.account) {
        await Account.findByIdAndDelete(user.account);
      }
      await User.findByIdAndDelete(id);
      resolve({
        status: 'OK',
        message: 'Delete User Success',
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateUser = async (id, data) => {
  try {
    // Kiểm tra nếu data trống thì không cập nhật
    if (!Object.keys(data).length) {
      return { status: 'ERROR', message: 'No data to update' };
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, {
      new: true, // Trả về dữ liệu sau khi update
      runValidators: true, // Kiểm tra validation khi update
    });

    if (!updatedUser) {
      return { status: 'ERROR', message: 'User not found' };
    }

    return { status: 'OK', message: 'SUCCESS', data: updatedUser };
  } catch (error) {
    console.error('Error updating user:', error);
    return { status: 'ERROR', message: 'Internal server error' };
  }
};

const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (user === null) {
        resolve({
          status: 'ERR',
          message: 'The user is not exists getDetail',
        });
      }
      resolve({
        status: 'OK',
        message: 'Success getDetail',
        data: user,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  getAllUser,
  deleteUser,
  updateUser,
  getDetailsUser,
};
