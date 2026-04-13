const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp'
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// 密码加密中间件
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// 比较密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// 生成验证令牌
userSchema.methods.generateVerificationToken = function() {
  this.verificationToken = require('crypto').randomBytes(32).toString('hex');
  return this.verificationToken;
};

// 生成重置密码令牌
userSchema.methods.generateResetPasswordToken = function() {
  this.resetPasswordToken = require('crypto').randomBytes(32).toString('hex');
  this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1小时后过期
  return this.resetPasswordToken;
};

module.exports = mongoose.model('User', userSchema);