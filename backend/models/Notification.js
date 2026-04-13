const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // 接收通知的用户
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 发起通知的用户
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 通知类型
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention'],
    required: true
  },
  // 相关帖子（点赞、评论时）
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  // 评论内容（评论时）
  content: {
    type: String
  },
  // 是否已读
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 创建索引
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
