/**
 * 云矜裤后端服务
 * 提供API接口支持前端功能
 */

// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const { default: MongoStore } = require('connect-mongo');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// AI服务配置
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

// 数据库连接
require('./config/database');

// 中间件 - CORS配置支持多个origin
const allowedOrigins = [
  'http://localhost:3000',
  'http://47.110.125.139',
  'http://42.121.15.36',
  'http://yunjinyimeng.cn',
  'https://yunjinyimeng.cn'
];

app.use(cors({
  origin: (origin, callback) => {
    // 允许无origin的请求（如移动端、Postman）
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS拒绝origin:', origin);
      callback(null, true); // 开发阶段暂时允许所有origin
    }
  },
  credentials: true
}));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'yun-jin-ku-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/yun-jin-ku'
  }),
  cookie: {
    secure: false, // 开发环境设为 false
    httpOnly: true,
    sameSite: 'lax', // 允许同站请求携带 cookie
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（用于访问上传的头像和帖子媒体）
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // 设置缓存策略
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 确保 posts 上传目录存在
const postsUploadsDir = path.join(__dirname, 'uploads', 'posts');
if (!fs.existsSync(postsUploadsDir)) {
  fs.mkdirSync(postsUploadsDir, { recursive: true });
}

// Multer 配置（头像上传）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '云矜裤后端服务运行中',
    timestamp: new Date().toISOString()
  });
});

// API信息接口
app.get('/api', (req, res) => {
  res.json({
    name: '云矜裤API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      recognition: '/api/recognition',
      gallery: '/api/gallery',
      auth: '/api/auth/*'
    }
  });
});

// ==================== 用户认证路由 ====================

const User = require('./models/User');
const { sendVerificationEmail, sendVerificationCodeEmail, sendResetPasswordEmail } = require('./config/email');

// 临时存储待注册用户信息（使用内存存储，实际生产环境建议使用Redis）
const pendingRegistrations = new Map();

// 用户注册（第一步：发送验证码）
app.post('/api/auth/register/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    // 验证输入
    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已被注册'
      });
    }

    // 检查是否在60秒内已经发送过验证码
    if (pendingRegistrations.has(email)) {
      const pendingData = pendingRegistrations.get(email);
      if (pendingData.expiresAt > Date.now()) {
        const remainingTime = Math.ceil((pendingData.expiresAt - Date.now()) / 1000);
        return res.status(429).json({
          success: false,
          error: `请等待 ${remainingTime} 秒后再重新发送`,
          remainingTime
        });
      }
    }

    // 生成6位验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 设置验证码过期时间为10分钟
    pendingRegistrations.set(email, {
      verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      createdAt: Date.now()
    });

    // 发送验证码邮件
    await sendVerificationCodeEmail(email, '用户', verificationCode);

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      expiresIn: 600 // 10分钟（秒）
    });

  } catch (error) {
    console.error('发送注册验证码失败:', error);
    res.status(500).json({
      success: false,
      error: '发送验证码失败，请稍后重试'
    });
  }
});

// 用户注册（第二步：验证码验证并创建账户）
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, verificationCode } = req.body;

    // 验证输入
    if (!username || !email || !password || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: '请填写所有必填字段（包括验证码）'
      });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少为6位'
      });
    }

    // 检查是否有待注册记录
    if (!pendingRegistrations.has(email)) {
      return res.status(400).json({
        success: false,
        error: '请先获取验证码'
      });
    }

    const pendingData = pendingRegistrations.get(email);

    // 检查验证码是否过期
    if (pendingData.expiresAt < Date.now()) {
      pendingRegistrations.delete(email);
      return res.status(400).json({
        success: false,
        error: '验证码已过期，请重新获取'
      });
    }

    // 检查验证码是否正确
    if (pendingData.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        error: '验证码错误'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        pendingRegistrations.delete(email);
        return res.status(400).json({
          success: false,
          error: '用户名已存在'
        });
      }
      if (existingUser.email === email) {
        pendingRegistrations.delete(email);
        return res.status(400).json({
          success: false,
          error: '邮箱已被注册'
        });
      }
    }

    // 创建用户
    const user = new User({ username, email, password });
    user.isVerified = true; // 已经验证过邮箱，直接标记为已验证
    await user.save();

    // 清除待注册记录
    pendingRegistrations.delete(email);

    // 保存用户到 session（自动登录）
    req.session.userId = user._id;
    req.session.username = user.username;

    res.status(201).json({
      success: true,
      message: '注册成功！',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试'
    });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '请填写邮箱和密码'
      });
    }

    // 查找用户
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
    }

    // 保存用户到 session
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试'
    });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: '未登录'
    });
  }

  try {
    // 从数据库查询完整的用户信息
    const user = await User.findById(req.session.userId).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// 退出登录
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: '退出登录失败'
      });
    }

    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: '退出登录成功'
    });
  });
});

// 验证邮箱
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: '缺少验证令牌'
      });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '验证令牌无效或已过期'
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功！'
    });

  } catch (error) {
    console.error('邮箱验证失败:', error);
    res.status(500).json({
      success: false,
      error: '邮箱验证失败'
    });
  }
});

// 重新发送验证邮件
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已验证'
      });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(email, user.username, verificationToken);

    res.json({
      success: true,
      message: '验证邮件已重新发送'
    });

  } catch (error) {
    console.error('重新发送验证邮件失败:', error);
    res.status(500).json({
      success: false,
      error: '发送失败，请稍后重试'
    });
  }
});

// 发送邮箱验证码
app.post('/api/auth/send-verification-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已验证'
      });
    }

    // 检查是否在60秒内已经发送过验证码
    if (user.verificationCodeExpires && user.verificationCodeExpires > Date.now()) {
      const remainingTime = Math.ceil((user.verificationCodeExpires - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        error: `请等待 ${remainingTime} 秒后再重新发送`,
        remainingTime
      });
    }

    // 生成6位验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 设置验证码过期时间为10分钟
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendVerificationCodeEmail(email, user.username, verificationCode);

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      expiresIn: 600 // 10分钟（秒）
    });

  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      error: '发送验证码失败，请稍后重试'
    });
  }
});

// 验证邮箱验证码
app.post('/api/auth/verify-email-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱和验证码'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: '该邮箱已验证'
      });
    }

    // 检查验证码是否过期
    if (!user.verificationCodeExpires || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        error: '验证码已过期，请重新获取'
      });
    }

    // 检查验证码是否正确
    if (user.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        error: '验证码错误'
      });
    }

    // 验证成功，更新用户状态
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功！'
    });

  } catch (error) {
    console.error('验证码验证失败:', error);
    res.status(500).json({
      success: false,
      error: '验证失败，请稍后重试'
    });
  }
});

// 请求重置密码
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: '请提供邮箱地址'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return res.json({
        success: true,
        message: '如果该邮箱已注册，您将收到重置密码的邮件'
      });
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save();

    await sendResetPasswordEmail(email, user.username, resetToken);

    res.json({
      success: true,
      message: '如果该邮箱已注册，您将收到重置密码的邮件'
    });

  } catch (error) {
    console.error('请求重置密码失败:', error);
    res.status(500).json({
      success: false,
      error: '请求失败，请稍后重试'
    });
  }
});

// 重置密码
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: '密码长度至少为6位'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '重置令牌无效或已过期'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: '密码重置成功！请使用新密码登录'
    });

  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      success: false,
      error: '重置密码失败，请稍后重试'
    });
  }
});

// 获取当前登录用户资料
app.get('/api/users/me/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: '请先登录'
      });
    }

    const user = await User.findById(req.session.userId)
      .select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('获取当前用户资料失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户资料失败'
    });
  }
});

// 获取完整用户信息
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

// 更新用户资料
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 检查是否登录
    if (!req.session.userId || req.session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权修改该用户资料'
      });
    }

    const { username, bio } = req.body;

    // 如果修改用户名，检查是否已被使用
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: '用户名已被使用'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(username && { username }),
        ...(bio !== undefined && { bio })
      },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 更新 session
    req.session.username = user.username;

    res.json({
      success: true,
      message: '用户资料更新成功',
      data: user
    });

  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      error: '更新用户资料失败'
    });
  }
});

// 更改密码
app.put('/api/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;

    // 检查是否登录
    if (!req.session.userId || req.session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权修改该用户密码'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '请提供当前密码和新密码'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: '新密码长度至少为6位'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 验证当前密码
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      success: false,
      error: '修改密码失败'
    });
  }
});

// 上传头像
app.post('/api/users/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;

    // 检查是否登录
    if (!req.session.userId || req.session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权修改该用户头像'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请选择要上传的头像'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      });
    }

    // 删除旧头像（如果是上传的，不是默认头像）
    if (user.avatar && !user.avatar.includes('cdn.wegic.ai')) {
      const oldAvatarPath = path.join(__dirname, user.avatar.replace('/uploads/', ''));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新头像路径
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('上传头像失败:', error);

    // 如果上传失败，删除已上传的文件
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      error: '上传头像失败，请稍后重试'
    });
  }
});

// AI识别接口（代理到Python服务）
app.post('/api/recognition', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: '缺少image参数'
      });
    }

    console.log('转发识别请求到AI服务...');

    // 转发请求到Python AI服务
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/api/recognition`,
      { image },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 35000 // 35秒超时
      }
    );

    // 返回AI服务的响应
    res.json(aiResponse.data);

  } catch (error) {
    console.error('AI识别请求失败:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'AI服务未启动，请先启动AI服务'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'AI识别超时'
      });
    }

    res.status(500).json({
      success: false,
      error: '识别请求失败',
      details: error.message
    });
  }
});

// ==================== 共赏页面路由 ====================

// 帖子相关路由
const postsRouter = require('./routes/posts');
app.use('/api/posts', postsRouter);

// 点赞相关路由
const likesRouter = require('./routes/likes');
app.use('/api/likes', likesRouter);

// 收藏相关路由
const collectionsRouter = require('./routes/collections');
app.use('/api/collections', collectionsRouter);

// 评论相关路由
const commentsRouter = require('./routes/comments');
app.use('/api/comments', commentsRouter);

// 关注相关路由
const followsRouter = require('./routes/follows');
app.use('/api/follows', followsRouter);

// 弹幕相关路由
const danmakusRouter = require('./routes/danmakus');
app.use('/api/danmakus', danmakusRouter);

// 高德地图代理路由
const amapRouter = require('./routes/amap');
app.use('/api/amap', amapRouter);

// 通知相关路由
const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

// 私信相关路由
const messagesRouter = require('./routes/messages');
app.use('/api/messages', messagesRouter);

// 静态文件服务 - 私信媒体文件
app.use('/uploads/messages', express.static(path.join(__dirname, 'uploads/messages')));

// 画廊数据接口（示例）
app.get('/api/gallery', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: '画廊数据接口已就绪'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log('    云矜裤后端服务启动成功');
  console.log('========================================');
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}/api`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log('========================================');
  console.log('按 Ctrl+C 停止服务');
  console.log('========================================');
});