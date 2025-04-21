const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  role_id: { type: Number, required: true, unique: true },
  name: { type: String, enum: ["ADMIN", "CUSTOMER"], required: true },
});

const accountSchema = new mongoose.Schema({
  account_id: { type: Number, required: true, unique: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roles: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
      name: { type: String },
    },
  ],
});

const userSchema = new mongoose.Schema(
  {
    // họ và tên
    name: { type: String, unique: true, required: true, index: true },
    email: { type: String, unique: true, index: true },
    // ngày sinh
    dateOfBirth: { type: Date, required: false },
    password: { type: String, required: true },
    phone: { type: Number, index: true },
    avatar: { type: String },
    loginType: { type: String },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    address: [
      {
        ward: { type: String },
        district: { type: String },
        city: { type: String },
        country: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
  }
);
// Chỉ mục phức hợp này có thể được sử dụng nếu bạn có các truy vấn mà lọc dựa trên cả name và email.
const User = mongoose.model("User", userSchema);
const Role = mongoose.model("Role", roleSchema);
const Account = mongoose.model("Account", accountSchema);
module.exports = { Role, Account, User };
