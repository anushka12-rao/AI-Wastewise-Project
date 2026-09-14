const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'passwordHash is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

module.exports = { AdminUser };
