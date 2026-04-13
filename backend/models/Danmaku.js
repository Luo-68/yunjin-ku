const mongoose = require('mongoose');

const danmakuSchema = new mongoose.Schema({
  // 帖子ID
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // 发送者
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 弹幕内容
  content: {
    type: String,
    required: true,
    maxlength: 100
  },
  // 视频播放时间（秒）
  time: {
    type: Number,
    required: true,
    min: 0
  },
  // 弹幕颜色
  color: {
    type: String,
    default: '#FFFFFF'
  },
  // 弹幕位置（top/middle/bottom）
  position: {
    type: String,
    enum: ['top', 'middle', 'bottom'],
    default: 'middle'
  },
  // 弹幕类型（scroll/fixed）
  type: {
    type: String,
    enum: ['scroll', 'fixed'],
    default: 'scroll'
  },
  // 字体大小
  fontSize: {
    type: Number,
    default: 25
  }
}, {
  timestamps: true
});

// 索引
danmakuSchema.index({ post: 1, time: 1 });
danmakuSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Danmaku', danmakuSchema);