const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yun-jin-ku';

mongoose.connect(MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 连接成功');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB 连接失败:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB 连接断开');
});

module.exports = mongoose;